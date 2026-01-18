// script-contact.js
// Contact page specific JavaScript

// Contact data dictionary
const contactData = {
    "Departments": [
        {
            "name": "Gedela V Satyanarayana",
            "phone": "+917763807795",
            "displayPhone": "+91-776-380-7795",
            "description": "Chief Khondbond"
        },
        {
            "name": "Rajesh Kumar",
            "phone": "+917033094900",
            "displayPhone": "+91-703-309-4900",
            "description": "Head (Mining Operations)"
        },
        {
            "name": "Garav Vikram Singh",
            "phone": "+919776579999",
            "displayPhone": "+91-977-657-9999",
            "description": "Head Equipment Maintenance"
        },
        {
            "name": "Vijay Shankar",
            "phone": "+919040083963",
            "displayPhone": "+91-904-008-3963",
            "description": "Head Wet Processing O&M Khondbond"
        },
        {
            "name": "Kanuri Appala Raju",
            "phone": "+919040083952",
            "displayPhone": "+91-904-008-3952",
            "description": "Head (Logistics), Khondbond"
        },
        {
            "name": "Abhishek Singh",
            "phone": "+918093754869",
            "displayPhone": "+91-809-375-4869",
            "description": "Area Manager Excavation"
        },
        {
            "name": "Jivitesh Kumar Anokhe",
            "phone": "+919031052966",
            "displayPhone": "+91-903-105-2966",
            "description": "Area Manager (Safety)"
        },
        {
            "name": "Ranjan Kumar Patra",
            "phone": "+917064423745",
            "displayPhone": "+91-706-442-3745",
            "description": "Sr.Area Manager (Drilling & Blasting)"
        },
        {
            "name": "Asit Kumar Nayak",
            "phone": "+917064423722",
            "displayPhone": "+91-706-442-3722",
            "description": "Sr. Area Manager Plant Operations"
        },
        {
            "name": "Anuj Kumar",
            "phone": "+919040094173",
            "displayPhone": "+91-904-009-4173",
            "description": "Sr.Area Manager Security"
        }
    ],
    "First-Aid": [
    {
        "name": "JITEN KARUA",
        "phone": "+919437403437",
        "displayPhone": "+91-943-740-3437",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "MD. MURSAD",
        "phone": "+919778245726",
        "displayPhone": "+91-977-824-5726",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "AMIYA BARIK",
        "phone": "+919583477344",
        "displayPhone": "+91-958-347-7344",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SUCHITA KULLU",
        "phone": "+919438053789",
        "displayPhone": "+91-943-805-3789",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RAJESH KUMAR",
        "phone": "+917033094900",
        "displayPhone": "+91-703-309-4900",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "ASIT KUMAR NAYAK",
        "phone": "+917064423722",
        "displayPhone": "+91-706-442-3722",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RANJAN KUMAR PATRA",
        "phone": "+917064423745",
        "displayPhone": "+91-706-442-3745",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "MANOHAR SINKU",
        "phone": "+918093955426",
        "displayPhone": "+91-809-395-5426",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "KISHOR NANDA",
        "phone": "+919437598490",
        "displayPhone": "+91-943-759-8490",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RAJENDRA MISHRA",
        "phone": "+918984425379",
        "displayPhone": "+91-898-442-5379",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RABI SANKAR PANDEY",
        "phone": "+919937599827",
        "displayPhone": "+91-993-759-9827",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "R K PATTNAIK",
        "phone": "+919237027393",
        "displayPhone": "+91-923-702-7393",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "VISHNU PURI",
        "phone": "+918596955800",
        "displayPhone": "+91-859-695-5800",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RAJESH POTHAL",
        "phone": "+918984178564",
        "displayPhone": "+91-898-417-8564",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "MURARI MOHANTY",
        "phone": "+918093592587",
        "displayPhone": "+91-809-359-2587",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SOUAYA OJHA",
        "phone": "+918895035128",
        "displayPhone": "+91-889-503-5128",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "PRABIN DASH",
        "phone": "+918895990787",
        "displayPhone": "+91-889-599-0787",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "DHIREN MOHANTY",
        "phone": "+917752004322",
        "displayPhone": "+91-775-200-4322",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "S S MOHANTY",
        "phone": "+919237012818",
        "displayPhone": "+91-923-701-2818",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "BALRAM MAHANTA",
        "phone": "+918596909101",
        "displayPhone": "+91-859-690-9101",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "S SATHPATHY",
        "phone": "+917381778565",
        "displayPhone": "+91-738-177-8565",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "PRAKASH DHIR",
        "phone": "+919178762277",
        "displayPhone": "+91-917-876-2277",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SANJAY MOHANTY",
        "phone": "+919437205235",
        "displayPhone": "+91-943-720-5235",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "BANAMALI SAHU",
        "phone": "+919777011304",
        "displayPhone": "+91-977-701-1304",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "JIVITESH KUMAR ANOKHE",
        "phone": "+919031052966",
        "displayPhone": "+91-903-105-2966",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "LINGRAJ MAHANTA",
        "phone": "+917643992959",
        "displayPhone": "+91-764-399-2959",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "KARTHIK M",
        "phone": "+919264190117",
        "displayPhone": "+91-926-419-0117",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RANENDRA PRATAP SWAIN",
        "phone": "+919237060444",
        "displayPhone": "+91-923-706-0444",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SAJAN KUMAR",
        "phone": "+918895250223",
        "displayPhone": "+91-889-525-0223",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "BISWANATH DEHURY",
        "phone": "+919439514343",
        "displayPhone": "+91-943-951-4343",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RAJENDRA MATIA",
        "phone": "+919348007131",
        "displayPhone": "+91-934-800-7131",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SUBHASH KUMAR GUPTA",
        "phone": "+916371896512",
        "displayPhone": "+91-637-189-6512",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "RAGHUNARAYAN MISHRA",
        "phone": "+919040732014",
        "displayPhone": "+91-904-073-2014",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SASMITA MAHANTA",
        "phone": "+917894492439",
        "displayPhone": "+91-789-449-2439",
        "description": "First-Aider at Khondbond"
    },
    {
        "name": "SATYARANJAN OJHA",
        "phone": "+917381066468",
        "displayPhone": "+91-738-106-6468",
        "description": "First-Aider at Khondbond"
    }
]
};

// Function to initialize the contact list
function initializeContactList() {
    const categoryTabs = document.getElementById('categoryTabs');
    const contactsGrid = document.getElementById('contactsGrid');
    
    // Create category tabs
    Object.keys(contactData).forEach(category => {
        const tab = document.createElement('div');
        tab.className = 'category-tab';
        if (category === 'Departments') {
            tab.classList.add('active');
        }
        tab.textContent = category;
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            // Add active class to clicked tab
            tab.classList.add('active');
            // Display contacts for this category
            displayContacts(category);
        });
        categoryTabs.appendChild(tab);
    });
    
    // Display initial contacts (Emergency)
    displayContacts('Departments');
    
    // Function to display contacts for a specific category
    function displayContacts(category) {
        contactsGrid.innerHTML = '';
        
        contactData[category].forEach(contact => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            
            contactItem.innerHTML = `
                <h3>${contact.name}</h3>
                <p>${contact.description}</p>
                <a href="tel:${contact.phone}" class="contact-phone">${contact.displayPhone}</a>
            `;
            
            contactsGrid.appendChild(contactItem);
        });
    }
}

// Function to add a new contact to the dictionary
function addContact(category, name, phone, displayPhone, description) {
    if (!contactData[category]) {
        contactData[category] = [];
    }
    
    contactData[category].push({
        name: name,
        phone: phone,
        displayPhone: displayPhone,
        description: description
    });
    
    // Refresh the display
    const activeTab = document.querySelector('.category-tab.active');
    if (activeTab) {
        displayContacts(activeTab.textContent);
    }
}

// Initialize contact list when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeContactList();
});
