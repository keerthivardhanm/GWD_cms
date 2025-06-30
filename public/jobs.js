document.addEventListener('DOMContentLoaded', function () {
    // --- PASTE YOUR FIREBASE CONFIGURATION HERE ---
    const firebaseConfig = {
        apiKey: "AIzaSyA6s8RkorDxYy96M-UcU1dm60rLCm0xaTU",
        authDomain: "gmc-cms-v2.firebaseapp.com",
        projectId: "gmc-cms-v2",
        storageBucket: "gmc-cms-v2.firebasestorage.app",
        messagingSenderId: "854866143960",
        appId: "1:854866143960:web:1583c1d23439dd2284c5ad",
        measurementId: "G-49ZJ13X62D"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // DOM Elements
    const jobsListContainer = document.getElementById('jobsList');
    const searchInput = document.getElementById('searchInput');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('jobDescModal');
    const modalTitle = document.getElementById('jobDescTitle');
    const modalBody = document.getElementById('jobDescBody');
    const closeModalBtn = document.getElementById('closeJobDescModal');

    let allJobsData = []; // To store all jobs for filtering

    // Fetch and render jobs
    async function fetchAndRenderJobs() {
        try {
            const pagesRef = db.collection('pages');
            const querySnapshot = await pagesRef.where('slug', '==', 'jobs-listing').limit(1).get();

            if (querySnapshot.empty) {
                jobsListContainer.innerHTML = '<p style="text-align:center; color: #900;">No job listings page found. Ensure a page with slug "jobs-listing" exists and is published.</p>';
                return;
            }

            const pageData = querySnapshot.docs[0].data();
            allJobsData = pageData.content?.jobs || [];

            if (allJobsData.length === 0) {
                 jobsListContainer.innerHTML = '<p style="text-align:center;">No job openings at the moment. Please check back later.</p>';
                 return;
            }
            
            renderJobs(allJobsData);

        } catch (error) {
            console.error("Error fetching job listings:", error);
            jobsListContainer.innerHTML = '<p style="text-align:center; color: #900;">Could not load job listings. Please try again later.</p>';
        } finally {
            if(loader) loader.style.display = 'none';
        }
    }

    function renderJobs(jobsToRender) {
        jobsListContainer.innerHTML = ''; // Clear current content
        
        if (jobsToRender.length === 0) {
            jobsListContainer.innerHTML = '<p style="text-align:center;">No jobs match your search.</p>';
            return;
        }

        jobsToRender.forEach(job => {
            const jobBar = document.createElement('div');
            // Use classes from CMS data, with fallbacks
            jobBar.className = job.job_container_class || 'job-bar';
            
            // This now uses all fields from your schema for full control
            jobBar.innerHTML = `
                <span class="${job.job_flag_title_class || 'job-flag-title'}">
                    ${job.flag_image_url ? `<img src="${job.flag_image_url}" alt="${job.flag_alt_text || job.country}" class="${job.flag_class || 'job-flag'}">` : ''}
                    <span class="${job.job_role_class || 'job-role'}">${job.job_title || ''}</span>
                </span>
                <span class="${job.job_country_class || 'job-country'}">${job.country || ''}</span>
                <span class="${job.job_location_class || 'job-location'}"><i class="${job.location_icon_class || ''}"></i> ${job.location || ''}</span>
                <span class="${job.job_type_class || 'job-type'}"><i class="${job.job_type_icon_class || ''}"></i> ${job.job_type || ''}</span>
                <span class="${job.job_experience_class || 'job-experience'}"><i class="${job.experience_icon_class || ''}"></i> ${job.experience_required || ''}</span>
                <button class="${job.button_class || 'btn btn-outline-primary btn-sm learn-more-btn'}">${job.button_text || 'Learn More'}</button>
            `;

            jobBar.querySelector('button').addEventListener('click', () => {
                modalTitle.textContent = job.job_title || 'Job Details';
                modalBody.textContent = job.job_description || 'No description available.';
                modal.style.display = 'block';
            });

            jobsListContainer.appendChild(jobBar);
        });
    }

    // --- Event Listeners ---
    
    // Modal close functionality
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Search input functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredJobs = allJobsData.filter(job => 
            (job.job_title && job.job_title.toLowerCase().includes(searchTerm)) ||
            (job.location && job.location.toLowerCase().includes(searchTerm)) ||
            (job.job_role && job.job_role.toLowerCase().includes(searchTerm)) ||
            (job.country && job.country.toLowerCase().includes(searchTerm))
        );
        renderJobs(filteredJobs);
    });

    // Initial fetch
    fetchAndRenderJobs();
});
