const myApp = {};

myApp.searchedFood;
myApp.fromIndex = 0;
myApp.toIndex = 10;

myApp.resetRecipeContainer = function(){
    $(".searchResult").empty();
};

myApp.resetMoreBtnContainer = function() {
    $(".moreBtn-container").empty();
}

myApp.resetRecipeIndex = function() {
    myApp.fromIndex = 0,
    myApp.toIndex = 10;
}

myApp.searchFood = function(food, fromIndex, toIndex) {
    //API used: https://developer.edamam.com/
    const foodRecipe = $.ajax({
        url : 'https://api.edamam.com/search',
        dataType : 'json',
        method: 'GET',
        data: {
            q: `${food}`,
            app_id: "2ac02505",
            app_key: "8faeb997cf524048887ac634d6afe384",
            from: fromIndex,
            to: toIndex
        }
    }).then(function(data) {
        myApp.displayRecipe(data, food);
        if(data.more === true){
            const moreBtnHtml = `
                <button class="moreBtn">More Recipes</button>
            `;
            $(".moreBtn-container").append(moreBtnHtml);
        };
    });
};

myApp.displayRecipe = function(searchedRecipe, food) {
    console.log(searchedRecipe);
    const recipes = searchedRecipe.hits;
    let htmlToAppend;
    if(recipes.length > 0) {
        recipes.forEach(recipe => {
            const recipeImg = recipe.recipe.image;
            const recipeName = recipe.recipe.label;
            const calories = recipe.recipe.calories;
            const time = recipe.recipe.totalTime;
            const serving = recipe.recipe.yield;
            //Array
            const healthLabels = recipe.recipe.healthLabels.join(", ");
            //URL
            const instructions = recipe.recipe.url;
            htmlToAppend = `
                <div class="recipe">
                    <div class="recipe-image-container">
                        <img src="${recipeImg}" class="recipe-image" alt="${recipeName}">
                    </div>
                    <div class="recipe-information">
                        <div class="recipe-heading">
                            <h2 class="recipe-Name">${recipeName}</h2>
                            <h3 class="recipe-Time">Time: ${time}</h3>
                        </div>
                        <h3>Serving(s): ${serving}</h3>
                        <h3>Health Label: ${healthLabels}</h3>
                        <h3>Calories: ${Math.round(calories)}</h3>
                        <h3>Instructions: <a href="${instructions}">Click here for more instructions...</a></h3>
                    </di>
                </div>
            `;
            $(".searchResult").append(htmlToAppend);
        });
    }else {
        htmlToAppend = `
            <h2 class="failedSearch">Sorry, we cannot find any "${food}" recipe</h2>
        `;
        $(".searchResult").append(htmlToAppend);
    };
};

myApp.listeners = function(){
    $("form").on("submit", (event) => {
        event.preventDefault();
        myApp.resetRecipeContainer();
        myApp.resetMoreBtnContainer();
        myApp.resetRecipeIndex();
        myApp.searchedFood = $(".foodToSearch").val();
        $(".searchResult").css("margin-top", "100px");
        myApp.searchFood(myApp.searchedFood, myApp.fromIndex, myApp.toIndex);
        $("form").trigger("reset");
    });

    //we use delegate function here because moreBtn is the appended HTML. The binding cant happen if the element you want to click isnt there at the time of page ready. 
    $("body").delegate(".moreBtn", "click", () => {
        console.log(`More clicked`);
        myApp.fromIndex += 10;
        myApp.toIndex +=10;
        myApp.resetMoreBtnContainer();
        myApp.searchFood(myApp.searchedFood, myApp.fromIndex, myApp.toIndex);
    });

};


myApp.init = function(){
    myApp.listeners();
};

$(document).ready(function() {
    myApp.init();
});