let linksData = {};
const linksPath = './app/node/datas/links.json';

async function main () {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('username').textContent = data.username;
            } else {
                document.getElementById('welcome').textContent = 'You are not logged in!';
            }
        })
        .catch(error => console.error('Error:', error));

    const categories = await fetch('./datas/categories.json');
    const categoriesData = await categories.json();
    const types = await fetch('./datas/types.json');
    const typesData = await types.json();

    displayForm(categoriesData, typesData)
    
    fetch('./app/node/datas/links.json')
        .then(response => response.json())
        .then(data => {
            window.jsonData = data;
            linksData = data;
            displayData(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayForm(categoriesData,typesData) {
    const container = document.getElementById('form-container');
    container.innerHTML = '';

    const form = document.createElement('form');

    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.name = 'link';
    linkInput.placeholder = 'Link';
    linkInput.classList.add('form-control');
    form.appendChild(linkInput);
    form.appendChild(document.createElement('br'));

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.placeholder = 'Title';
    titleInput.classList.add('form-control');
    form.appendChild(titleInput);
    form.appendChild(document.createElement('br'));

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.name = 'author';
    authorInput.placeholder = 'Author';
    authorInput.classList.add('form-control');
    form.appendChild(authorInput);
    form.appendChild(document.createElement('br'));

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.name = 'date';
    dateInput.classList.add('form-control');
    form.appendChild(dateInput);
    form.appendChild(document.createElement('br'));

    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.name = 'description';
    descriptionTextarea.placeholder = 'Description';
    descriptionTextarea.classList.add('form-control');
    form.appendChild(descriptionTextarea);
    form.appendChild(document.createElement('br'));

    const categorySelect = document.createElement('select');
    categorySelect.classList.add('form-select');
    categorySelect.name = 'category';
    categoriesData.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    form.appendChild(categorySelect);
    form.appendChild(document.createElement('br'));

    const typeSelect = document.createElement('select');
    typeSelect.name = 'type';
    typeSelect.classList.add('form-select');
    typesData.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
    form.appendChild(typeSelect);
    const button = document.createElement('button');
    button.classList.add('btn','btn-secondary','mt-3');
    button.type = 'button';
    button.id = 'addnewbutton';
    button.textContent = 'Add New';
    form.appendChild(button);
    form.appendChild(document.createElement('br'));

    button.addEventListener('click', () => {
        
        let newData = { 
            "link": linkInput.value || "",
            "category": categorySelect.value || "",
            "type": typeSelect.value || "",
            "title": titleInput.value || "",
            "description": descriptionTextarea.value || "",
            "date": dateInput.value || "",
            "author": authorInput.value || ""
        };
    
        let alertMsg = [];
    
        if (!newData.link) alertMsg.push('Link');
        if (!newData.title) alertMsg.push('Title');
        if (!newData.date) alertMsg.push('Date');
        if (!newData.author) alertMsg.push('Author');
        if (!newData.description) alertMsg.push('Description');
        if (!newData.category) alertMsg.push('Category');
        if (!newData.type) alertMsg.push('Type');
    
        if (alertMsg.length > 0) {
            let alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = `Please fill in the following fields: ${alertMsg.join(', ')}`;            
            container.appendChild(alertDiv);
    
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        } else {
            button.disabled = true;
            button.innerHTML = 'Adding... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            addData(newData);
        }
    });
    
    container.appendChild(form);
}

async function deleteData(index) {
    try {
        linksData.splice(index, 1);
        const response = await fetch('/api/deleteData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(linksData)
        });

        if (response.ok) {  
            return true;
        } else {
            console.error('Failed to delete data.');
            return false;
        }
        
    } catch (error) {
        console.error('Error deleting data:', error);
        return false;
    }
    
}
async function addData(data) {
    try {
        const response = await fetch('/api/addData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            await main();
            const container = document.getElementById('form-container');
            let alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success';
            alertDiv.textContent = `New data added successfully!`;            
            container.appendChild(alertDiv);
    
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        } else {
            console.error('Failed to add data.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayData(data) {    

    const container = document.getElementById('data-container');
    container.innerHTML = '';    

    data.forEach((item, index) => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-sm-6', 'col-md-4', 'col-lg-3');

        const boxDiv = document.createElement('div');
        boxDiv.classList.add('box');

        const ind = document.createElement('div');
        ind.textContent = index + 1 + ':';
        boxDiv.appendChild(ind);

        const meta = document.createElement('div');
        if(item.date && item.author) {        
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('date');
            dateSpan.textContent = item.date;

            const authorSpan = document.createElement('span');
            authorSpan.classList.add('author');
            authorSpan.textContent = ' - ' + item.author;

            meta.appendChild(dateSpan);
            meta.appendChild(authorSpan);
            boxDiv.appendChild(meta);
        }

        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';

        const boxTitleDiv = document.createElement('div');
        boxTitleDiv.classList.add('box-title');
        boxTitleDiv.textContent = item.title || 'No Title';

        // Link only wraps around the title now
        link.appendChild(boxTitleDiv);

        const boxDescriptionDiv = document.createElement('div');
        boxDescriptionDiv.classList.add('box-description');
        boxDescriptionDiv.textContent = item.description || 'No Description';

        const span = document.createElement('span');
        span.classList.add('tag');
        span.textContent = item.type;

        const span2 = document.createElement('span');
        span2.classList.add('tag');
        span2.textContent = item.category;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-secondary', 'mt-2');
        deleteButton.addEventListener('click', async() => {
            const confirmDelete = confirm('Are you sure you want to delete this item?');
            if (confirmDelete) {
                deleteButton.disabled = true;
                deleteButton.innerHTML = 'Deleting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                let success = await deleteData(index);
                if (success) {
                    deleteButton.disabled = false;
                    deleteButton.innerHTML = 'Delete';
                    let alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-success';
                    alertDiv.textContent = `Successfully deleted!`;            
                    boxDiv.appendChild(alertDiv);
                
                    setTimeout(async() => {
                        alertDiv.remove();
                        await main();
                    }, 5000);
                } else {
                    deleteButton.disabled = false;
                    deleteButton.innerHTML = 'Delete';
                    let alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-danger';
                    alertDiv.textContent = `Delete failed!`;            
                    boxDiv.appendChild(alertDiv);
                
                    setTimeout(() => {
                        alertDiv.remove();
                    }, 5000);
                }
            } else {
                console.log('Deletion canceled.');

            }            
        });

        const hr = document.createElement('hr');
        
        boxDiv.appendChild(link); // Now the link is only around the title
        boxDiv.appendChild(boxDescriptionDiv);
        boxDiv.appendChild(span);        
        boxDiv.appendChild(span2);
        colDiv.appendChild(boxDiv);
        boxDiv.appendChild(deleteButton);                
        boxDiv.appendChild(hr);
        container.appendChild(colDiv);
    });
}


main()