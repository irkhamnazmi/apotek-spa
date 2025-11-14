$(document).ready(function() {
  if ($('#dataTable').length) {
    $('#dataTable').DataTable({
      pageLength: 10,
      responsive: true,
    });
  }

});

