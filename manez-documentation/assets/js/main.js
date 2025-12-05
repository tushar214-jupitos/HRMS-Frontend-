(function ($) {
  ("use strict");


  /* Dashboard Sidebar nav activation */
  document.addEventListener('DOMContentLoaded', function () {
    // Get the current URL's last part
    var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    // Select all <a> tags inside the sidebar navigation
    const navLinks = document.querySelectorAll('.manez-sidebar-nav ul li a');
    navLinks.forEach(link => {
      // If the href of the link matches the current URL or is empty, add 'active' class
      if (link.getAttribute('href') === pgurl || link.getAttribute('href') === '') {
        link.classList.add('active');
      }
    });
  });

  /* Sidebar js */
  $("#sidebarActive").on("click", function () {
    if (window.innerWidth > 0 && window.innerWidth <= 991) {
      $(".manez-sidebar, .app-header, .app-page-body").toggleClass("open");
    } else {
      $(".manez-sidebar, .app-header, .app-page-body").toggleClass("collapsed");
    }
    $(".app-offcanvas-overlay").toggleClass("overlay-open");
  });
  $(".app-offcanvas-overlay").on("click", function () {
    $(".manez-sidebar, .app-header, .app-page-body").removeClass("collapsed");
    $(".manez-sidebar, .app-header, .app-page-body").removeClass("open");
    $(".app-offcanvas-overlay").removeClass("overlay-open");
  });

  	/* footer year */
	var yearElement = document.getElementById("year");
	if (yearElement) { yearElement.innerHTML = new Date().getFullYear(); }
	/* footer year */

})(jQuery);
