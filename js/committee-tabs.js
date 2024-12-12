document.addEventListener('DOMContentLoaded', function() {
  // Get unique committee names from the table
  var committeeNames = Array.from(new Set(Array.from(document.querySelectorAll('#committee-table tbody tr td:first-child')).map(function(td) {
    return td.textContent.trim();
  })));

  // Create tabs dynamically
  var tabsContainer = document.createElement('div');
  tabsContainer.id = 'tabs-container';
  tabsContainer.className = 'd-flex flex-wrap mb-3';

  committeeNames.forEach(function(committeeName) {
    var tab = document.createElement('button');
    tab.className = 'btn btn-outline-primary me-2 mb-2'; // Added mb-2 for vertical spacing
    tab.textContent = committeeName;
    tab.addEventListener('click', function() {
      filterTable(committeeName);
    });
    tabsContainer.appendChild(tab);
  });

  // Insert tabs before the table
  var tableParent = document.querySelector('#committee-table').parentNode;
  tableParent.insertBefore(tabsContainer, document.querySelector('#committee-table'));

  // Function to filter the table based on the selected committee
  function filterTable(committeeName) {
    var tableRows = document.querySelectorAll('#committee-table tbody tr');
    tableRows.forEach(function(row) {
      if (row.textContent.includes(committeeName)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Highlight the active tab
    tabsContainer.querySelectorAll('button').forEach(function(tab) {
      tab.classList.toggle('active', tab.textContent === committeeName);
    });
  }
});