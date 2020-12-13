<script>
  let htmlContent = "";
  fetch("/chapter/part1/index.html")
    .then((response) => {
      console.dir(response);
      return response.text();
    })
    .then((html) => {
      htmlContent = html;
    });
</script>

<p>Home Page</p>
{@html htmlContent}
