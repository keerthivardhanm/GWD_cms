document.addEventListener('DOMContentLoaded', () => {

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
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // DOM Elements
    const jobsListContainer = document.getElementById('jobsList');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('jobDescModal');
    const modalTitle = document.getElementById('jobDescTitle');
    const modalBody = document.getElementById('jobDescBody');
    const closeModalBtn = document.getElementById('closeJobDescModal');
    
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');

    let allJobsData = []; // To store the master list of jobs

    async function fetchAllJobsPages() {
        try {
            const pagesRef = db.collection('pages');
            const jobsQuery = pagesRef.where('slug', '==', 'jobs-listing');
            const snapshot = await jobsQuery.get();

            if (snapshot.empty) {
                jobsListContainer.innerHTML = `<p style="text-align:center; color: red;">No job listings page found. Please ensure a page with the slug "jobs-listing" exists.</p>`;
                return;
            }

            let allJobs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const jobs = Array.isArray(data?.content?.jobs) ? data.content.jobs : [];
                allJobs = allJobs.concat(jobs);
            });
            
            allJobsData = allJobs; // Store master list

            if (!allJobsData.length) {
                jobsListContainer.innerHTML = `<p style="text-align:center;">No job openings currently.</p>`;
                return;
            }
            
            populateFilters(allJobsData);
            renderJobs(allJobsData);
            setupEventListeners();

        } catch (error) {
            console.error("Job fetch error:", error);
            jobsListContainer.innerHTML = `<p style="text-align:center; color: red;">Failed to load jobs.</p>`;
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function populateFilters(jobs) {
        const locations = new Set();
        const experiences = new Set();
        
        jobs.forEach(job => {
            if (job.country) locations.add(job.country);
            if (job.experience) experiences.add(job.experience);
        });

        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        experiences.forEach(experience => {
            const option = document.createElement('option');
            option.value = experience;
            option.textContent = experience;
            experienceFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedLocation = locationFilter.value;
        const selectedExperience = experienceFilter.value;

        const filteredJobs = allJobsData.filter(job => {
            const titleMatch = job.title?.toLowerCase().includes(searchTerm);
            const roleMatch = job.role?.toLowerCase().includes(searchTerm);
            const locationMatch = !selectedLocation || job.country === selectedLocation;
            const experienceMatch = !selectedExperience || job.experience === selectedExperience;

            return (titleMatch || roleMatch) && locationMatch && experienceMatch;
        });

        renderJobs(filteredJobs);
    }
    
    function setupEventListeners() {
        searchInput.addEventListener('input', applyFilters);
        locationFilter.addEventListener('change', applyFilters);
        experienceFilter.addEventListener('change', applyFilters);
        resetFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            locationFilter.value = '';
            experienceFilter.value = '';
            renderJobs(allJobsData);
        });
    }

    function renderJobs(jobs) {
        jobsListContainer.innerHTML = '';

        if (jobs.length === 0) {
            jobsListContainer.innerHTML = '<p style="text-align:center;">No job openings match your criteria.</p>';
            return;
        }

        jobs.forEach(job => {
            const jobBar = document.createElement('div');
            // Use classes from the CMS data, with fallbacks
            jobBar.className = job.job_container_class || 'job-bar';

            const title = job.title || 'N/A';
            const country = job.country || 'N/A';
            const flag = job.flag || '';
            const location = job.location || 'N/A';
            const role = job.role || 'N/A';
            const experience = job.experience || 'N/A';
            const description = job.desc || 'No description available.';

            jobBar.innerHTML = `
                <span class="${job.job_flag_title_class || 'job-flag-title'}">
                    ${flag ? `<img src="${flag}" alt="${job.flag_alt_text || country}" class="${job.flag_class || 'job-flag'}">` : ''}
                    <span class="${job.job_role_class || 'job-role'}">${title}</span>
                </span>
                <span class="${job.job_country_class || 'job-country'}">${country}</span>
                <span class="${job.job_location_class || 'job-location'}"><i class="${job.location_icon_class || 'fas fa-map-marker-alt'}"></i> ${location}</span>
                <span class="${job.job_type_class || 'job-type'}"><i class="${job.job_type_icon_class || 'fas fa-user-md'}"></i> ${role}</span>
                <span class="${job.job_experience_class || 'job-experience'}"><i class="${job.experience_icon_class || 'fas fa-briefcase'}"></i> ${experience}</span>
                <button class="${job.button_class || 'btn btn-outline-primary btn-sm learn-more-btn'}">${job.button_text || 'Learn More'}</button>
            `;

            jobBar.querySelector('.learn-more-btn').addEventListener('click', () => {
                modalTitle.textContent = title;
                modalBody.innerHTML = description.replace(/\n/g, '<br>'); // Support newlines in description
                modal.style.display = 'block';
            });

            jobsListContainer.appendChild(jobBar);
        });
    }

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    fetchAllJobsPages();
});
