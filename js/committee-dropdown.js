document.addEventListener('DOMContentLoaded', function() {
  // Get unique filter names from the table
  // To change the column to filter, change the "td:'value'" to whichever td child is required. I.e. first column is "first-child".
  let filterNames = Array.from(new Set(Array.from(document.querySelectorAll('table.table-filter tbody tr td:first-child')).map(function(td) {
    return td.textContent.trim();
  })));
  // Create a dropdown menu dynamically
  let dropdownContainer = document.createElement('div');
  dropdownContainer.id = 'table-filter-dropdown-container';
  dropdownContainer.className = 'mb-3';
  let dropdown = document.createElement('select');
  dropdown.className = 'form-select';
  dropdown.title = 'Filter by';
  dropdown.addEventListener('change', function() {
    filterTable(this.value);
  });
  let allOption = document.createElement('option');
  allOption.textContent = 'All';
  allOption.selected = true;
  dropdown.appendChild(allOption);
  filterNames.forEach(function(filterName) {
    let option = document.createElement('option');
    option.textContent = filterName;
    dropdown.appendChild(option);
  });
  dropdownContainer.appendChild(dropdown);
  // Insert dropdown before the table
  let tableParent = document.querySelector('table.table-filter').parentNode;
  tableParent.insertBefore(dropdownContainer, document.querySelector('table.table-filter'));
  // Function to filter the table based on the selected filter name
  function filterTable(filterName) {
    let tableRows = document.querySelectorAll('table.table-filter tbody tr');
    tableRows.forEach(function(row) {
      if (filterName === 'All' || row.textContent.includes(filterName)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  // Initialize filtering with "All" selected
  filterTable('All');
});


// Version 2:

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Get the number of columns in the table
  let numColumns = document.querySelector('table.table-filter thead tr').childElementCount;

  // Create an array to store filter names for each column
  let filterNames = Array.from({ length: numColumns }, function() {
    return new Set();
  });

  // Loop through each column and get unique filter names
  document.querySelectorAll('table.table-filter thead tr th').forEach(function(th, index) {
    if (!th.classList.contains('table-filter-no')) {
      document.querySelectorAll('table.table-filter tbody tr td:nth-child(' + (index + 1) + ')').forEach(function(td) {
        filterNames[index].add(td.textContent.trim());
      });
    }
  });

  // Create dropdown menus dynamically
  for (let i = 0; i < numColumns; i++) {
    let dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'mb-3';

    let dropdown = document.createElement('select');
    dropdown.className = 'form-select';
    dropdown.title = 'Filter by';
    dropdown.addEventListener('change', function() {
      filterTable(this.value, i);
    });

    let allOption = document.createElement('option');
    allOption.textContent = 'All';
    allOption.selected = true;
    dropdown.appendChild(allOption);

    filterNames[i].forEach(function(filterName) {
      let option = document.createElement('option');
      option.textContent = filterName;
      dropdown.appendChild(option);
    });

    dropdownContainer.appendChild(dropdown);

    // Insert dropdown before the table
    let tableParent = document.querySelector('table.table-filter').parentNode;
    tableParent.insertBefore(dropdownContainer, document.querySelector('table.table-filter'));
  }

  // Function to filter the table based on the selected filter name
  function filterTable(filterName, columnIndex) {
    let tableRows = document.querySelectorAll('table.table-filter tbody tr');
    tableRows.forEach(function(row) {
      let cell = row.children[columnIndex]; // No need to adjust index for "Ignore" columns
      if (filterName === 'All' || cell.textContent.trim() === filterName) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Initialize filtering with "All" selected for each dropdown
  for (let i = 0; i < numColumns; i++) {
    filterTable('All', i);
  }
});
</script>
