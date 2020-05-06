const myZomato = {};

myZomato.apiKey = "ed57e4f690ae84719a513bd21731b370";
myZomato.torontoCityId = 89;
myZomato.currentCategoryIndex = 0;

myZomato.categories = {
    chinese: 25,
    burger: 168,
    japanese: 60,
    mexican: 73 
};

myZomato.emptySearchResult = function() {
    $(".search-result").empty();
};

myZomato.getColletions = function() {
    const collectionsPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/collections",
        dataType: 'json',
        method: 'GET',
        data: {
            city_id: myZomato.torontoCityId,
            count: 5
        }
    });

    collectionsPromise.done(function(result) {
        const collectionArray = result.collections;

        for(let i = 0; i<collectionArray.length; i++) {
            let image = collectionArray[i].collection.image_url;
            let title = collectionArray[i].collection.title;
            let description = collectionArray[i].collection.description;
            let trendingUrl = collectionArray[i].collection.url;
            let restaurantCount = collectionArray[i].collection.res_count;
            
            
            let collectionHTML = `
                <div class="collection-image${i}">
                    <a href="${trendingUrl}">
                        <div class="banner" style="background-image: linear-gradient(to bottom left, rgba(245, 246, 252, 0), rgba(0, 0, 0, 0.23)), url(${image})"></div>
                    </a>
                    <div class="banner-title">
                        <h1>${title}</h1>
                        <p>${description}</p>
                        <p>Places: ${restaurantCount}</p>
                    </div>
                </div>
            `;

            $(".banner-container").append(collectionHTML);
        };

        $(".banner-container").slick({
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3000 
        });

    }).fail(function(error){
        console.log(error);
    });

};

myZomato.addPagination = function(numberOfRestaurant, limitPerPage) {
    if(numberOfRestaurant > limitPerPage){
        const paginationHtml = `
            <nav class="page-navigation">
                <ul class="pagination">
                    <li class="previous-item"><a href="#">Previous</a></li>
                    <li class="page-item active"><a href="#">1</a></li>

                </ul>
            </nav>
        `;

        $(".search-result").append(paginationHtml);

        $(`.restaurant-link:gt(${limitPerPage - 1})`).hide();
        let numberOfPages = Math.round(numberOfRestaurant / limitPerPage);
        for(let i = 2; i <= numberOfPages; i++) {
            $(".pagination").append(`<li class="page-item"><a href="#">${i}</a></li>`);
        }
        $(".pagination").append(`<li class="next-item"><a href="#">Next</a></li>`);

        $(".pagination li.page-item").on("click", function() {
            if($(this).hasClass("active")){
                return false;
            }else {
                let currentPage = $(".page-item").index(this) + 1;
                $(".pagination li").removeClass("active");
                $(this).addClass("active");
                $(".restaurant-link").hide();

                
                let grandTotal = limitPerPage * currentPage;
                for(let i = grandTotal - limitPerPage; i < grandTotal; i++){
                    $(`.restaurant-link:eq(${i})`).show();
                }
            }
        });
        
        $(".next-item").on("click", function() {
            let currentPage = $(".pagination li.active").index();
            if(currentPage === numberOfPages) {
                return false;
            }else {
                currentPage++;
                $(".pagination li").removeClass("active");
                $(".restaurant-link").hide();

                let grandTotal = limitPerPage * currentPage;
                for(let i = grandTotal - limitPerPage; i < grandTotal; i++){
                    $(`.restaurant-link:eq(${i})`).show();
                };

                $(`.pagination li.page-item:eq(${currentPage - 1})`).addClass("active");
            };
        });

        $(".previous-item").on("click", function() {
            let currentPage = $(".pagination li.active").index();
            if(currentPage === 1) {
                return false;
            }else {
                currentPage--;
                $(".pagination li").removeClass("active");
                $(".restaurant-link").hide();

                let grandTotal = limitPerPage * currentPage;
                for(let i = grandTotal - limitPerPage; i < grandTotal; i++){
                    $(`.restaurant-link:eq(${i})`).show();
                }

                $(`.pagination li.page-item:eq(${currentPage - 1})`).addClass("active");
            }
        });
    }
}

myZomato.getCuisines = function(cuisineId) {
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
        console.log(result);
        const restaurantArray = result.restaurants;
        const numberOfResult = result.results_shown;
        let ratingColorIndex = 0;
        restaurantArray.forEach(restaurant => {
            const name = restaurant.restaurant.name;
            const address = restaurant.restaurant.location.address;
            const phoneNumber = restaurant.restaurant.phone_numbers;
            const rating = restaurant.restaurant.user_rating.aggregate_rating;
            const ratingColor = restaurant.restaurant.user_rating.rating_color;
            const photo = restaurant.restaurant.featured_image;
            const url = restaurant.restaurant.url;

            const htmlToAppend = `
                <a href="${url}" class="restaurant-link fade-in">
                    <div class="restaurant-container">
                        <img src="${photo}" alt="restaurant image" class="restaurant-image">
                        
                        <div class="restaurant-description">
                            <h3>${name}</h3>
                            <p>Address: ${address}</p>
                            <p>Phone: ${phoneNumber}</p>
                        </div>
                        <div class="rating rating${ratingColorIndex}">
                            <p>${rating}</p>
                        </div>
                    </div>
                </a>
            `;

            $(".search-result").append(htmlToAppend);
            $(`.rating${ratingColorIndex} p`).css("background-color", `#${ratingColor}`);
            ratingColorIndex++;
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
    const restaurantPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/search",
        dataType: 'json',
        method: 'GET',
        data: {
            entity_id: myZomato.torontoCityId,
            entity_type: "city",
            q: restaurantName,
            sort: "rating"
        }
    });

    restaurantPromise.done(function(result) {
        if(result.results_found>0){
            const restaurantArray = result.restaurants;
            const numberOfResult = result.results_shown;
            let ratingColorIndex = 0;
            restaurantArray.forEach(restaurant => {
                const name = restaurant.restaurant.name;
                const address = restaurant.restaurant.location.address;
                const phoneNumber = restaurant.restaurant.phone_numbers;
                const rating = restaurant.restaurant.user_rating.aggregate_rating;
                const ratingColor = restaurant.restaurant.user_rating.rating_color;
                const photo = restaurant.restaurant.featured_image;
                const url = restaurant.restaurant.url;
    
                const htmlToAppend = `
                    <a href="${url}" class="restaurant-link">
                        <div class="restaurant-container">
                            <img src="${photo}" alt="restaurant image" class="restaurant-image">
                            
                            <div class="restaurant-description">
                                <h3>${name}</h3>
                                <p>Address: ${address}</p>
                                <p>Phone: ${phoneNumber}</p>
                            </div>
                            <div class="rating rating${ratingColorIndex}">
                                <p>${rating}</p>
                            </div>
                        </div>
                    </a>
                `;
    
                $(".search-result").append(htmlToAppend);
                $(`.rating${ratingColorIndex} p`).css("background-color", `#${ratingColor}`);
                ratingColorIndex++;
            });

            let limitPerPage = 5;
            if(numberOfResult > limitPerPage) {
                myZomato.addPagination(numberOfResult, limitPerPage);
            };
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
    $(".food-category").on("click", function() {
        const data = $(this).data("category");
        myZomato.emptySearchResult();
        myZomato.getCuisines(myZomato.categories[data]);
    });

    $("form").on("submit", (event) => {
        event.preventDefault();
        myZomato.emptySearchResult();
        myZomato.searchRestaurant($(".userInput").val());
        $("form").trigger("reset");
    });

    $("select").change(function() {
        
        // alert($("select option:selected").text());
    });
};

myZomato.setCategoryButton = function() {
    let num = 928;
    if(myZomato.currentCategoryIndex === 0) {
        $(".previousBtn").hide();
    };

    
    $(".nextBtn").on("click", () => {
        //length 928px in progress
        myZomato.currentCategoryIndex+=1;
        $('.category-list').animate({
            scrollLeft: num * myZomato.currentCategoryIndex
        }, 'slow');

        if(myZomato.currentCategoryIndex === 2){
            $(".nextBtn").prop('disabled', true);
            $(".nextBtn").hide();
        }

        $(".previousBtn").show();
        $(".previousBtn").prop('disabled', false);
    });

    $(".previousBtn").on("click", () => {
        //length 928px in progress
        myZomato.currentCategoryIndex-=1;

        $('.category-list').animate({
            scrollLeft: num * myZomato.currentCategoryIndex
        }, 'slow');

        if(myZomato.currentCategoryIndex === 0){
            $(".previousBtn").prop('disabled', true);
            $(".previousBtn").hide();
        }

        $(".nextBtn").show();
        $(".nextBtn").prop('disabled', false);


    });
};

myZomato.restaurantNearMe = function() {
    const restaurantPromise = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/search",
        dataType: 'json',
        method: 'GET',
        data: {
            entity_id: myZomato.torontoCityId,
            entity_type: "city",
            start: 0,
            lat: 43.627499,
            lon: -79.396167,
            sort: "real_distance"
        }
    });
    const restaurantPromise2 = $.ajax({
        headers: {"user-key": `${myZomato.apiKey}`},
        url:"https://developers.zomato.com/api/v2.1/search",
        dataType: 'json',
        method: 'GET',
        data: {
            entity_id: myZomato.torontoCityId,
            entity_type: "city",
            start: 21,
            lat: 43.627499,
            lon: -79.396167,
            sort: "real_distance"
        }
    });


    $.when(restaurantPromise, restaurantPromise2)
        .done(function(result, result2) {

            const numberOfResult = result[0].results_shown + result2[0].results_shown;

            let ratingColorIndex = 1;
            myZomato.addResult(result, ratingColorIndex);
            ratingColorIndex+=20;
            myZomato.addResult(result2, ratingColorIndex);
            let limitPerPage = 10;
            if(numberOfResult > limitPerPage) {
                myZomato.addPagination(numberOfResult, limitPerPage);
            };
        }).fail(function(error) {
        console.log(error);
    });

}

myZomato.addResult = function(result, ratingColorIndex) {
    const restaurantArray = result[0].restaurants;
    restaurantArray.forEach(restaurant => {
        const name = restaurant.restaurant.name;
        const address = restaurant.restaurant.location.address;
        const phoneNumber = restaurant.restaurant.phone_numbers;
        const rating = restaurant.restaurant.user_rating.aggregate_rating;
        const ratingColor = restaurant.restaurant.user_rating.rating_color;
        const photo = restaurant.restaurant.featured_image;
        const url = restaurant.restaurant.url;

        const htmlToAppend = `
            <a href="${url}" class="restaurant-link">
                <div class="restaurant-container">
                    <img src="${photo}" alt="restaurant image" class="restaurant-image">
                    
                    <div class="restaurant-description">
                        <h3>${name}</h3>
                        <p>Address: ${address}</p>
                        <p>Phone: ${phoneNumber}</p>
                    </div>
                    <div class="rating rating${ratingColorIndex}">
                        <p>${rating}</p>
                    </div>
                </div>
            </a>
        `;

        $(".search-result").append(htmlToAppend);
        $(`.rating${ratingColorIndex} p`).css("background-color", `#${ratingColor}`);
        ratingColorIndex++;
    });
};

myZomato.resetCategoryScrollView = function() {
    $(".category-list").scrollLeft(0);
}

myZomato.init = function() {
    myZomato.getColletions();
    myZomato.resetCategoryScrollView();
    myZomato.restaurantNearMe();
    myZomato.setCategoryButton();
    myZomato.listeners();
};


$(function() {
    myZomato.init();
});