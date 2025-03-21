import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import FridgeNav from "./FridgeNav";
import RecipeBanners from "./RecipeBanners";
import styles from "./Recipes.module.css";
import { generate } from "./GeminiRecipes";
import { getFoodItem, getFridgeContents } from "../Util";
import RecipeDetails from "./RecipeDetails";
import Spinner from "./Spinner";
import axios from "axios";

function Recipes() {
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [currentFridge, setCurrentFridge] = useState(null);
    const [AIloading, setAILoading] = useState(false);
    const [recipeSelected, setRecipeSelected] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [viewSaved, setViewSaved] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [fridges, setFridges] = useState([]);
    const [ifAddedRecipe, setIfAddedRecipe] = useState(false);

    const makePrompt = async (existedRecipe, restrictions=null) => {
        console.log("current fridge:")
        console.log(currentFridge)
        let ingredients = await getFridgeContents(currentFridge.fridgeID);
        console.log("Ingredients:", ingredients);
      
        let prompt = "Generate me another recipe including but not limited to the following ingredients: ";
        if (ingredients.length > 0) {
            prompt += ingredients[0].name;
        }
        for (let i = 1; i < ingredients.length; i++) {
            prompt += " and " + ingredients[i].name;
        }
      
        if (restrictions != null) {
            prompt += ". But exclude the following:";
            for (const restriction in restrictions) {
                prompt += restriction + " and ";
            }
        }
      
        if (existedRecipe.length != 0) {
            prompt += ". Do not give me these recipes:"
            for (const existed of existedRecipe) {
                prompt += existed["recipe_name"] + " and ";
            }
        }
        
        console.log("Generated Prompt:", prompt);
        return prompt.trim();
    }
    
    useEffect(() => {
        console.log("Updated savedRecipes:", savedRecipes);
    }, [savedRecipes]);

    const onButtonClick = async () => {
        let temp = [];
        setAILoading(true);
        for (let i = 0; i < 10 && temp.length < 3; i++) {
            const prompt = await makePrompt(temp);
            const result = await generate(prompt);
            if (result != null) {
                temp.push(result);
            }
        }
        setGeneratedRecipes(temp);
        setAILoading(false);
    }

    const replaceRecipe = async (id) => {
        const prompt = makePrompt(generatedRecipes);
        setAILoading(true);
        let newRecipe = await generate(prompt)
        if (newRecipe != null) {
            setGeneratedRecipes((prevRecipes) =>
                prevRecipes.map((recipe) =>
                    recipe.id === id ? newRecipe : recipe
                )
            );
        }
        setAILoading(false);
    }

    const saveRecipe = (recipe) => {
        // setSavedRecipes([...savedRecipes, recipe]);
        console.log(recipe)
        axios.post("http://127.0.0.1:5000/save_recipe", {
          fridgeID: currentFridge.fridgeID,
          recipe: {
            name: recipe.recipe_name,
            instructions: recipe.directions,
            createdBy: localStorage.getItem("username"),
            ingredients: recipe.ingredients,
            cuisine: '',
            dietaryRestrictions: ''
          }
        })
        .then((response) => {
            console.log("Saving a recipe")
            console.log(response)
            setIfAddedRecipe(true)
        });    
    }

    const removeSavedRecipe = async (recipe) => {
        console.log(recipe)
        setSavedRecipes(savedRecipes.filter(e => e.recipeID !== recipe.recipeID));
        axios.delete("http://127.0.0.1:5000/delete_recipe?fridgeID=" + currentFridge.fridgeID + "&recipeID=" + recipe.recipeID)
        .then((response) => {
            console.log(response.data.recipes)
        });
    }

    const recipeClicked = (recipe) => {
        console.log(recipe)
        setRecipeSelected(recipe);
    }

    const closeRecipe = () => {
        setRecipeSelected(null);
    }

    const useRecipe = () => {
        ;
    }

    const toogleViewSaved = async () => {
        console.log("Saved recipes")
        axios.get("http://127.0.0.1:5000/view_saved_recipes?fridgeID=" + currentFridge.fridgeID)
        .then((response) => {
            console.log(response.data.recipes)
            setSavedRecipes(response.data.recipes)
            setViewSaved(!viewSaved)
        });
    }

    const choices = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6", "Option 7"];

    return(
        <div className={styles.page}>
            <Navbar />
            <div className={styles.container}>
                <div>
                    {/* <FridgeNav setActiveFridge={(e) => setCurrentFridge(e)}/> */}
                    {currentFridge != null ?
                        <>
                            <p className={styles.menuHeader}>{currentFridge.name}</p>
                            <button className={styles.menuItem} onClick={onButtonClick}>{AIloading ? "Generating..." : "Generate Recipes"}</button> 
                            <button className={styles.menuItem} onClick={toogleViewSaved}>{viewSaved ? "Choose new Recipes" : "Saved Recipes"}</button>
                            <button className={styles.menuItem} onClick={() => {
                                setCurrentFridge(null);
                                setGeneratedRecipes([]);
                            }}>Back</button>
                        </>
                    : <Spinner setCurrentFridge={setCurrentFridge} />
                    }
                </div>
                
                {currentFridge != null ? 
                    (recipeSelected == null ? 
                        (!viewSaved ?
                            (<>
                                {generatedRecipes.length > 0 && !AIloading ?
                                    <RecipeBanners recipes={generatedRecipes} recipeClicked={recipeClicked} replaceRecipe={replaceRecipe} saveRecipe={saveRecipe}/> : ""
                                }
                            </>
                            ) : (
                                <div className={styles.savedRecipesList}>
                                    {savedRecipes.map((recipe, index) => (
                                        <div key={recipe.recipeID || index} className={styles.savedRecipe} onClick={() => recipeClicked(recipe)}>
                                            <div>
                                                <h4>{recipe.name}</h4>
                                            </div>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.actionButton} onClick={(event) => {
                                                    event.stopPropagation();
                                                    }} style={{ marginRight: '10px' }}>Use</button>
                                                <button className={styles.actionButton} onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeSavedRecipe(recipe);
                                                    }}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <RecipeDetails recipe={recipeSelected} closeRecipe={closeRecipe}/>
                        )
                    )
                : null}
            </div>
            
        </div>
    )
}

export default Recipes;