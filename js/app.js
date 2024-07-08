async function loadData() {
    try {
        const response = await fetch('/datas/datas.json');
        const data = await response.json();

        const categories = [...new Set(data.map(item => item.category))];
        const types = [...new Set(data.map(item => item.type))];
        
        displayData(data);
        displayFilters(categories, types);
        addFilterEventListeners(data);
        addSearchEventListener(data);
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

/*async function createFilters() {
    try {
        const categories = await fetch('/datas/categories.json');
        const categoriesData = await categories.json(); 
        const types = await fetch('/datas/types.json');
        const typesData = await types.json(); 
        console.log(categoriesData)
        console.log(typesData)
        displayFilters(categoriesData, typesData);
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}*/

function displayFilters(categoriesData, typesData) {
    const container = document.getElementById('categorySelector');
    container.innerHTML = ''; 

    categoriesData.forEach((item, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.textContent = item;
        a.classList.add('dropdown-item'); 
        a.id = `category-${index}`;
        li.appendChild(a);
        container.appendChild(li);
    });
    const typesContainer = document.getElementById('typeSelector');
    typesContainer.innerHTML = ''; 

    typesData.forEach((item, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.textContent = item;
        a.classList.add('dropdown-item'); 
        a.id = `type-${index}`;
        li.appendChild(a);
        typesContainer.appendChild(li);
    });
}

function addSearchEventListener(data) {
    const searchInput = document.getElementById('exampleDataList');
    const filterName = document.getElementById('filtername');
    searchInput.addEventListener('input', event => {
        const searchTerm = event.target.value.toLowerCase();
        if (searchTerm.length > 2) {
            const filteredData = data.filter(item => 
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
            filterName.innerHTML = '';
            filterName.textContent = 'Text: ' + event.target.value;
            displayData(filteredData);
        }
        if (searchTerm.length == 0) {    
            filterName.innerHTML = '';        
            displayData(data);
        }
        
    });
}

function addFilterEventListeners(data) {
    const filterName = document.getElementById('filtername');
    const searchInput = document.getElementById('exampleDataList');    
    const deleteFilter = document.getElementById('delete-filters');
    deleteFilter.addEventListener('click', event => {
        event.preventDefault(); 
        filterName.innerHTML = '';  
        searchInput.value = '';     
        displayData(data);
    });

    const categoryLinks = document.querySelectorAll('#categorySelector .dropdown-item');
    categoryLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const category = event.target.textContent;
            filterName.textContent = 'Category: ' + event.target.textContent;
            searchInput.value = '';
            const filteredData = data.filter(item => item.category === category);
            displayData(filteredData);
        });
    });

    const typeLinks = document.querySelectorAll('#typeSelector .dropdown-item');
    typeLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const type = event.target.textContent;
            const filteredData = data.filter(item => item.type === type);
            filterName.textContent = 'Type: ' + event.target.textContent;
            searchInput.value = '';
            displayData(filteredData);
        });
    });
}

function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = '';

    data.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-sm-6', 'col-md-4', 'col-lg-3');

        const boxDiv = document.createElement('div');
        boxDiv.classList.add('box');

        const boxImageDiv = document.createElement('div');
        boxImageDiv.classList.add('box-image');

        const img = document.createElement('img');
        img.src = item.ogimage || 'https://placehold.co/150x150?text=No+Image+Found';
        img.alt = item.title || 'Image';
        img.classList.add('w-100');

        const boxTitleDiv = document.createElement('div');
        boxTitleDiv.classList.add('box-title');
        boxTitleDiv.textContent = item.title || 'No Title';

        const boxDescriptionDiv = document.createElement('div');
        boxDescriptionDiv.classList.add('box-description');
        boxDescriptionDiv.textContent = item.description || 'No Description';

        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.classList.add('stretched-link');

        boxImageDiv.appendChild(img);
        boxDiv.appendChild(boxImageDiv);
        boxDiv.appendChild(boxTitleDiv);
        boxDiv.appendChild(boxDescriptionDiv);
        boxDiv.appendChild(link);
        colDiv.appendChild(boxDiv);
        container.appendChild(colDiv);
    });
}

document.addEventListener('DOMContentLoaded', loadData);