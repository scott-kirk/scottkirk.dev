// Nav burger animation
$(document).ready(function() {

  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
      return false;
  });
});
// Bitty scrolling links script
$("a[href^=\"#\"]").click(function(e) {
    e.preventDefault();
    $("html, body").animate({
        scrollTop: $(document.getElementById(this.hash.substr(1))).offset().top
    }, 500);
    $("#nav-menu").removeClass("is-active");
    return true;
})

