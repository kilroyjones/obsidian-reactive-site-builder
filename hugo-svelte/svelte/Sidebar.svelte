<script>
  let menuActive = false;
  // list of items in accordian
  const Animals = [
    {
      name: "cat",
      display: "Meow!!",
    },
    {
      name: "dog",
      display: "Ruff Ruff!",
    },
    {
      name: "bird",
      display: "tweet tweet...",
    },
    {
      name: "Pig",
      display: "Oink Oink!!",
    },
  ];

  //current list item selection
  let selectionID;
  // handler to set current selection item
  const handleSelection = (item) => {
    selectionID = item;
    openedAccordion = 0;
  };

  // lookup to place display text of selected item in accordian header
  $: selection = selectionID ? Animals.find((item) => item.name == selectionID).display : "";

  // opened Accordion
  let openedAccordion = 0;
  const toggleAccordion = (e) => (openedAccordion = e.detail == openedAccordion ? 0 : e.detail);
</script>

<style>
  #sidebar-wrapper {
    min-height: 100vh;
    margin-left: -20rem;
    -webkit-transition: margin 0.25s ease-out;
    -moz-transition: margin 0.25s ease-out;
    -o-transition: margin 0.25s ease-out;
    transition: margin 0.25s ease-out;
  }

  #sidebar-wrapper .sidebar-heading {
    padding: 0.875rem 1.25rem;
    font-size: 1.2rem;
  }

  #sidebar-wrapper .list-group {
    width: 20rem;
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
      margin-left: -20rem;
    }
  }
</style>

<div class="d-flex" id="wrapper" class:toggled={menuActive}>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <slot name="sidebar-heading">
      <div class="sidebar-heading">Welcome!</div>
    </slot>
    <div class="list-group list-group-flush">
      <slot name="sidebar" />
    </div>
  </div>

  <div id="page-content-wrapper">
    <nav class="navbar  navbar-light bg-light border-bottom">
      <button class="navbar-toggler" id="menu-toggle" on:click={() => (menuActive = !menuActive)}>
        <span class="navbar-toggler-icon" />
      </button>
      <slot name="top-content">
        <div class="navbar-brand">Helloasdfs</div>
      </slot>
    </nav>
    <div class="container-fluid">
      <slot name="content" />
    </div>
  </div>
</div>
