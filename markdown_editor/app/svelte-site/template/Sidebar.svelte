<script>
  let menuActive = false;
  // list of items in accordian
</script>

<style>
  #sidebar-wrapper {
    min-height: 100vh;
    margin-left: -25rem;
    padding-top: 8px;
    padding-right: 20px;
    text-align: right;
    -webkit-transition: margin 0.25s ease-out;
    -moz-transition: margin 0.25s ease-out;
    -o-transition: margin 0.25s ease-out;
    transition: margin 0.25s ease-out;
  }

  #sidebar-wrapper .sidebar-heading {
    font-size: 2.2rem;
    padding-bottom: 1.5rem;
  }

  #sidebar-wrapper .list-group {
    width: 25rem;
    margin-left: 0px;
  }

  #page-content-wrapper {
    min-width: 100vw;
  }

  #wrapper.toggled #sidebar-wrapper {
    margin-left: 0;
  }

  @media (min-width: 768px) {
    #sidebar-wrapper {
      margin-left: 0;
    }

    #page-content-wrapper {
      min-width: 0;
      width: 100%;
    }

    #wrapper.toggled #sidebar-wrapper {
      margin-left: -25rem;
    }

    .navbar {
      background-color: #00000000;
    }
  }
</style>

<div class="d-flex" id="wrapper" class:toggled={menuActive}>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <slot name="sidebar-heading">
      <div class="sidebar-heading">Course Title</div>
    </slot>
    <div class="list-group list-group-flush">
      <slot name="sidebar" />
    </div>
  </div>

  <div id="page-content-wrapper">
    <nav class="navbar">
      <button
        class="navbar-toggler"
        id="menu-toggle"
        on:click={() => (menuActive = !menuActive)}>
        <span class="navbar-toggler-icon" />
      </button>
      <slot name="top-content">
        <div class="navbar-brand">Menu Items</div>
      </slot>
    </nav>
    <div class="container-fluid">
      <slot name="content" />
    </div>
  </div>
</div>
