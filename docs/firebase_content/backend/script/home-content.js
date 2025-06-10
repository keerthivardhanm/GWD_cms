import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYbsVI-4Zb0QTonR2iN-4GcLCBSrvisl8",
  authDomain: "ahs-cms-7f4f6.firebaseapp.com",
  projectId: "ahs-cms-7f4f6",
  storageBucket: "ahs-cms-7f4f6.firebasestorage.app",
  messagingSenderId: "132715335065",
  appId: "1:132715335065:web:77e7bf22320dc0d8675708",
  measurementId: "G-Z3E9BM7DCN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function fetchPages() {
    try {
        const pagesCollection = await db.collection('pages').get();
        const pagesData = pagesCollection.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Fetched pages:', pagesData);

        // Assuming you want to populate the 'home' page data
        const homePageData = pagesData.find(page => page.slug === 'home');

        if (homePageData) {
            populateHomePage(homePageData);
        } else {
            console.warn("Home page data not found in Firestore.");
        }

    } catch (error) {
        console.error('Error fetching pages:', error);
    }
}

function populateHomePage(data) {
    console.log('Populating Home Page with data:', data);
    // Populate Hero Section
 console.log('Populating Hero Section with data:', data.heroSection);
    const heroSlider = document.getElementById('hero-slider');
    if (heroSlider && data.heroSection && data.heroSection.slides) {
        heroSlider.innerHTML = ''; // Clear existing placeholders
        data.heroSection.slides.forEach(slide => {
 const slideElement = document.createElement('div');
            slideElement.classList.add('slide');
            if (slide.isActive) {
                slideElement.classList.add('active');
            }
            slideElement.innerHTML = `
                <img src="${slide.imgSrc}" alt="${slide.alt}" loading="lazy">
                <div class="slide-content">
                    <h1>${slide.heading || ''}</h1>
                    <p>${slide.paragraph || ''}</p>
                    ${slide.btnLink ? `<a href="${slide.btnLink}" class="btn-primary">${slide.btnText || 'Learn More'}</a>` : ''}
                    ${slide.secondaryBtnLink ? `<a href="${slide.secondaryBtnLink}" class="btn-secondary">${slide.secondaryBtnText || 'Enquire Now'}</a>` : ''}
                    ${slide.whatsappButtonUrl ? `<a href="${slide.whatsappButtonUrl}" class="btn-whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>` : ''}

                </div>
            `;
            heroSlider.appendChild(slideElement);
        });
    }

    // Populate Why Choose Us Section
    const whyChooseUsSection = document.querySelector('.why-choose-us');
    console.log('Populating Why Choose Us Section with data:', data.whyChoose);
    if (whyChooseUsSection && data.whyChoose && data.whyChoose.features) {
 const sectionHeader = whyChooseUsSection.querySelector('.section-header');
 if (sectionHeader) { sectionHeader.querySelector('h2').innerText = data.whyChoose.introHeading || ''; sectionHeader.querySelector('p').innerText = data.whyChoose.introParagraph || '';}
        const featuresGrid = whyChooseUsSection.querySelector('.features-grid');
        if (featuresGrid) {
            featuresGrid.innerHTML = ''; // Clear existing
            data.whyChoose.features.forEach(feature => {
                const featureCard = document.createElement('div');
                featureCard.classList.add('feature-card');
                featureCard.innerHTML = `
                    ${feature.iconClass ? `<div class="feature-icon"><i class="${feature.iconClass}"></i></div>` : ''}

                    <h3>${feature.title || ''}</h3>
                    <p>${feature.description}</p>
                `;
                featuresGrid.appendChild(featureCard);
            });
        }
    }

    // Populate Featured Programs Section
    const featuredProgramsSection = document.querySelector('.featured-programs');
    console.log('Populating Featured Programs Section with data:', data.programsList);
    if (featuredProgramsSection && data.programsList && data.programsList.programs) {
        const sectionHeader = featuredProgramsSection.querySelector('.container');
 if (sectionHeader) { sectionHeader.querySelector('h2').innerText = data.programsList.sectionHeading || 'Our Programs'; sectionHeader.querySelector('.featured-caption p').innerText = data.programsList.sectionIntro || '';}

        const programCards = featuredProgramsSection.querySelector('.program-cards');
        if (programCards) {
            programCards.innerHTML = ''; // Clear existing
            data.programsList.programs.forEach(program => {
                const programCard = document.createElement('div');
                programCard.classList.add('program-card');
                programCard.innerHTML = `<!-- Program cards will be loaded here from Firebase -->
                    <img src="${program.imgSrc || 'placeholder.jpg'}" alt="${program.alt || 'Program Image'}" loading="lazy">
                    <h3>${program.title || ''}</h3>
                    <p>${program.description || 'No description available.'}</p>
                    ${program.btnLink ? `<a href="${program.btnLink}" class="btn">Learn More</a>` : ''}
                `;
                programCards.appendChild(programCard);
            });
        }
    }

    // Populate Our Centres Section
    const ourCentresSection = document.querySelector('.our-centres');
    console.log('Populating Our Centres Section with data:', data.centres);
    if (ourCentresSection && data.centres && data.centres.centres) {
        if (ourCentresSection.querySelector('h2')) { ourCentresSection.querySelector('h2').innerText = data.centres.sectionHeading || 'Our Centres'; }
        const centreCards = ourCentresSection.querySelector('.centre-cards');
        if (centreCards) {
            centreCards.innerHTML = ''; // Clear existing
            data.centres.centres.forEach(centre => { // Changed from data.centres.list
                const centreCard = document.createElement('div');
                centreCard.classList.add('centre-card');
                centreCard.innerHTML = `
                    <img src="${centre.imgSrc || 'placeholder.jpg'}" alt="${centre.alt || 'Centre Image'}" loading="lazy">
                    <h3>${centre.name || ''}</h3>
                    <p>${centre.description || 'No description available.'}</p>
                    ${centre.btnLink ? `<a href="${centre.btnLink}" class="btn">View Details</a>` : ''}
                `;
                centreCards.appendChild(centreCard);
            });
        }
    }

    // Populate We are Apollo Section (Counters)
 console.log('Populating We are Apollo Section with data:', data.counters);
    const apolloSection = document.querySelector('.apollo-section');
    if (apolloSection && data.counters && data.counters.counters) {
        const apolloStatsContainer = apolloSection.querySelector('.apollo-stats');
 if (apolloStatsContainer) {
 apolloStatsContainer.innerHTML = ''; // Clear existing
            data.counters.counters.forEach((counter, index) => {
                const statBlock = document.createElement('div');
                statBlock.classList.add('stat-block');
                statBlock.innerHTML = `<!-- Apollo stats will be loaded here from Firebase -->
                    <h4>${counter.label || ''}</h4><h3 class="counter" data-target="${counter.value || '0'}">0</h3>
                `;
 apolloStatsContainer.appendChild(statBlock);
                if (index < data.counters.counters.length - 1) {
                    const divider = document.createElement('div');
                    divider.classList.add('divider');
 apolloStatsContainer.appendChild(divider);
                }
            });
        }

        // Re-trigger the counter animation script if needed.
        // The existing script uses an IntersectionObserver, which should re-trigger when the content is added.

 }

        // Update summary text
        const apolloSummary = apolloSection.querySelector('.apollo-summary');
 if (apolloSummary) {
            apolloSummary.innerHTML = `
                <h3>${data.counters.summaryTouchedLives || 'Touched'} <span><strong>${data.counters.summaryTouchedLivesValue || '0'}</strong></span> Lives</h3>
                <h3>${data.counters.summaryFromCountries || 'from'} <span><strong>${data.counters.summaryFromCountriesValue || '0'}</strong></span> Countries</h3>
            `;
 }

    } // Closing curly brace for if (apolloSection && data.counters && data.counters.counters)

    // Populate Accreditations Section

    // Clear existing placeholder from HTML
    const accreditationsLogosContainer = document.getElementById('accreditation-logos-container');
    if (accreditationsLogosContainer) {
        accreditationsLogosContainer.innerHTML = '';
    }
 console.log('Populating Accreditations Section with data:', data.accreditations);
    const accreditationsSection = document.querySelector('.accreditations');
 if (accreditationsSection && data.accreditations && data.accreditations.logos) {
 const sectionHeader = accreditationsSection.querySelector('.section-header');
 if (sectionHeader) { sectionHeader.querySelector('h2').innerText = data.accreditations.sectionHeading || 'Accreditations & Affiliations'; sectionHeader.querySelector('p').innerText = data.accreditations.sectionIntro || 'Our programs are recognized by leading national and international accreditation bodies';}

        const accreditationLogos = accreditationsSection.querySelector('.accreditation-logos');
        if (accreditationLogos) {
            accreditationLogos.innerHTML = ''; // Clear existing
            data.accreditations.logos.forEach(logo => {
                const logoItem = document.createElement('div'); // Corrected from `accreditationsSection.querySelector('.accreditation-logos')`
                logoItem.classList.add('logo-item');
                logoItem.innerHTML = `
                    <img src="${logo.imgSrc || 'placeholder.jpg'}" alt="${logo.alt || 'Accreditation Logo'}" loading="lazy">
 <span><b>${logo.name || ''}</b></span>
                `;
                accreditationLogos.appendChild(logoItem);
            });
        }
    }

    // Populate Global Connections Section
 console.log('Populating Global Connections Section with data:', data.globalPartnerships);
    const globalConnectionsSection = document.querySelector('.international-partnerships'); // Corrected selector
    if (globalConnectionsSection && data.globalPartnerships && data.globalPartnerships.partners) { // Changed from data.globalPartnerships.partnerships
 const sectionHeader = globalConnectionsSection.querySelector('.section-header');
        if (sectionHeader) {
            sectionHeader.querySelector('h2').innerText = data.globalPartnerships.sectionHeading || 'Global Connections';
            // Corrected from data.globalPartnerships.paragraph
            sectionHeader.querySelector('p').innerText = data.globalPartnerships.sectionIntro || 'Our international partnerships enhance learning opportunities and global exposure';
        }

        const partnershipsGrid = globalConnectionsSection.querySelector('.partnerships-grid');
        if (partnershipsGrid) {
            partnershipsGrid.innerHTML = ''; // Clear existing
            data.globalPartnerships.partners.forEach(partner => { // Changed from data.globalPartnerships.partnerships
                const partnershipCard = document.createElement('div');
                partnershipCard.classList.add('partnership-card');
                partnershipCard.innerHTML = `<img src="${partner.imgSrc || 'placeholder.jpg'}" alt="${partner.alt || 'Partner Image'}" loading="lazy"><h3>${partner.name || ''}</h3><p>${partner.description || ''}</p>`;
                partnershipsGrid.appendChild(partnershipCard);
            });

        }
    }
}

// Call the function to fetch pages when the script loads
fetchPages();
