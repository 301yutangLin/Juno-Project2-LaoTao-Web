const myZomato = {};

myZomato.apiKey = "ed57e4f690ae84719a513bd21731b370";
myZomato.torontoCityId = 89;
myZomato.trendingUrl;


myZomato.emptySearchResult = function() {
    $(".search-result").empty();
};

myZomato.setSearchResultHeaders = function() {
    const htmlAppendHeader = `
            <h2>Search Result</h2>
    `;
    $(".search-result").append(htmlAppendHeader);
}

myZomato.getColletions = function() {
    const collectionsPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/collections",
        dataType: 'json',
        method: 'GET',
        data: {
            city_id: myZomato.torontoCityId
        }
    });

    collectionsPromise.done(function(result) {
        const image = result.collections[0].collection.image_url;
        const title = result.collections[0].collection.title;
        const description = result.collections[0].collection.description;
        myZomato.trendingUrl = result.collections[0].collection.url;
        const restaurantCount = result.collections[0].collection.res_count;

        const htmlToAppend = `
            <img src=${image} class="banner-image">
        `;
        $(".banner").append(htmlToAppend);
        const titleToAppend = `
            <div class="banner-title">
                <h1>${title}</h1>
                <p>${description}</p>
                <p>Places: ${restaurantCount}</p>
            </div>
        `;
        $(".banner-container").append(titleToAppend);

    }).fail(function(error){
        console.log(error);
    });

};

myZomato.addPagination = function(numberOfRestaurant, limitPerPage) {
    if(numberOfRestaurant > limitPerPage){
        const paginationHtml = `
            <nav class="page-navigation">
                <ul class="pagination">
                    <li><a class="page-link" href="#">Previous</a></li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>

                </ul>
            </nav>
        `;

        $(".search-result").append(paginationHtml);

        $(`.restaurant-link:gt(${limitPerPage - 1})`).hide();
        let numberOfPages = Math.round(numberOfRestaurant / limitPerPage);
        for(let i = 2; i <= numberOfPages; i++) {
            console.log(i);
            $(".pagination").append(`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`);
        }
        $(".pagination").append(`<li><a class="page-link" href="#">Next</a></li>`);

        $(".page-item").on("click", function() {
            let currentPage = $(".page-item").index(this);
            console.log(currentPage);
        });
    }
}

myZomato.getCuisines = function(cuisineId) {
    myZomato.setSearchResultHeaders();
    const cuisinesPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/search",
        dataType: 'json',
        method: 'GET',
        data: {
            entity_id: myZomato.torontoCityId,
            entity_type: "city",
            cuisines: cuisineId,
            sort: "rating"
        }
    });

    cuisinesPromise.done(function(result) {
        const restaurantArray = result.restaurants;
        const numberOfResult = result.results_shown;
        restaurantArray.forEach(restaurant => {
            const name = restaurant.restaurant.name;
            const address = restaurant.restaurant.location.address;
            const phoneNumber = restaurant.restaurant.phone_numbers;
            const rating = restaurant.restaurant.user_rating.aggregate_rating;
            const ratingColor = restaurant.restaurant.user_rating.rating_color;
            const photo = restaurant.restaurant.photos ? restaurant.restaurant.photos[0].photo.url : restaurant.restaurant.thumb;
            const photoCaption = restaurant.restaurant.photos ? restaurant.restaurant.photos[0].photo.caption : `restaurant image`;
            const url = restaurant.restaurant.url;

            const htmlToAppend = `
                <a href="${url}" class="restaurant-link">
                    <div class="restaurant-container">
                        <img src="${photo}" alt="${photoCaption}" class="restaurant-image">
                        
                        <div class="restaurant-description">
                            <h3>${name}</h3>
                            <p>Address: ${address}</p>
                            <p>Phone: ${phoneNumber}</p>
                        </div>
                        <div class="rating">
                            <p>${rating}</p>
                        </div>
                    </div>
                </a>
            `;

            $(".search-result").append(htmlToAppend);

            $(".rating p").css("background-color" , `#${ratingColor}`);
        });

        let limitPerPage = 5;
        if(numberOfResult > limitPerPage) {
            myZomato.addPagination(numberOfResult, limitPerPage);
        };
    }).fail(function(error){
        console.log(error);
    });
};

myZomato.searchRestaurant = function(restaurantName) {
    myZomato.setSearchResultHeaders();
    const restaurantPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/search",
        dataType: 'json',
        method: 'GET',
        data: {
            entity_id: myZomato.torontoCityId,
            entity_type: "city",
            q: restaurantName,
            start: 0,
            count: 10,
            sort: "rating"
        }
    });

    restaurantPromise.done(function(result) {
        console.log(result);
        if(result.results_found>0){
            const restaurantArray = result.restaurants;
            restaurantArray.forEach(restaurant => {
                const name = restaurant.restaurant.name;
                const address = restaurant.restaurant.location.address;
                const phoneNumber = restaurant.restaurant.phone_numbers;
                const rating = restaurant.restaurant.user_rating.aggregate_rating;
                const ratingColor = restaurant.restaurant.user_rating.rating_color;
                const votes = restaurant.restaurant.user_rating.votes;
                const photo = restaurant.restaurant.photos ? restaurant.restaurant.photos[0].photo.url : restaurant.restaurant.thumb;
                const photoCaption = restaurant.restaurant.photos ? restaurant.restaurant.photos[0].photo.caption : `restaurant image`;
                const url = restaurant.restaurant.url;
    
                const htmlToAppend = `
                    <a href="${url}">
                        <div class="restaurant-container">
                            <img src="${photo}" alt="${photoCaption}" class="restaurant-image">
                            
                            <div class="restaurant-description">
                                <h3>${name}</h3>
                                <p>Address: ${address}</p>
                                <p>Phone: ${phoneNumber}</p>
                            </div>
                            <div class="rating">
                                <p>${rating}</p>
                            </div>
                        </div>
                    </a>
                `;
    
                $(".search-result").append(htmlToAppend);
    
                $(".rating p").css("background-color" , `#${ratingColor}`);
            });
        }else {
            const htmlToAppend = `
                <h2>No result found</h2>
            `;
            $(".search-result").append(htmlToAppend);
        }
    }).fail(function(error) {
        console.log(error);
    });
};

myZomato.listeners = function() {
    $(".banner-container").on("click", () =>{
        window.location.href = myZomato.trendingUrl;
    });

    $(".chinese-category").on("click", () => {
        myZomato.emptySearchResult();
        myZomato.getCuisines(25);
    });

    $(".burger-category").on("click", () => {
        myZomato.emptySearchResult();
        myZomato.getCuisines(168);
    });

    $(".japanese-category").on("click", () => {
        myZomato.emptySearchResult();
        myZomato.getCuisines(60);
    });

    $(".mexican-category").on("click", () => {
        myZomato.emptySearchResult();
        myZomato.getCuisines(73);
    });

    $("form").on("submit", (event) => {
        event.preventDefault();
        myZomato.emptySearchResult();
        myZomato.searchRestaurant($(".userInput").val());
        $("form").trigger("reset");
    });

};

myZomato.init = function() {
    myZomato.getColletions();
    myZomato.listeners();
};


$(function() {
    myZomato.init();
});