const ACCESS_TOKEN =
    "pk.eyJ1IjoidG9ubmlkaWF6IiwiYSI6ImNsbTg5YTk1eTBhaHczZHJyYmR1ZHhsM2cifQ.ockDRt9KPFkge-1zeyDhhA";

let features = [];
const coordinates = [27.82563, -26.6948865];
mapboxgl.accessToken = ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

const searchJS = document.getElementById("search-js");
searchJS.onload = function () {
    const searchBox = new MapboxSearchBox();
    searchBox.accessToken = ACCESS_TOKEN;
    searchBox.options = {
        types: "address,poi",
        proximity: coordinates,
    };
    searchBox.marker = true;
    searchBox.mapboxgl = mapboxgl;

    searchBox.addEventListener("retrieve", (event) => {
        const featureCollection = event.detail;
        features = featureCollection;
        console.log(featureCollection)
        //console.log("features:" + JSON.stringify(featureCollection));
        // ...
    });
    map.addControl(searchBox);
};
