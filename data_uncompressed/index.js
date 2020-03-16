document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#pop_sensors').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('imagemodal2').show();
    });

    items = document.querySelectorAll(".menuitem");
    items.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            var url = item.getAttribute("data-href");
            loadContent(url);
        });
    });

    loadContent("/data_uncompressed/distillation.htm");
    Init();
});

function loadContent(url) {
    var content = document.querySelector('#content');

    fetch(url)
        .then(response => response.text())
        .then(result => content.innerHTML = result)
        .then(x => {
            script = content.querySelector('script');
            eval(script.text);
        });
}



