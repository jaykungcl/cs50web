import { useFetch } from "../../hooks/useFetch";

//styles
import './Home.css'
//components
import RecipeList from "../../components/RecipeList";
import { useEffect, useState } from "react";


export default function Home() {
    const [recipes, setRecipes] = useState(null)
    const [search, setSearch] = useState('')

    const { data , error, isPending } = useFetch(`http://127.0.0.1:8000/api/recipes`);
    useEffect(() => {
        if(data && (search === '')) {
            setRecipes(data)
        } else if(data) {
            setRecipes(data.filter(recipe => {
                if(recipe.title.toUpperCase().includes(search.toUpperCase())) return true
                if(recipe.ingredients.filter(ing => ing.toUpperCase().includes(search.toUpperCase())).length > 0) return true
                return false
            }))
        }
    }, [data, search])

    return (
        <div className="home">
            <div>
                <input 
                    type="text" 
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    placeholder="Search Recipes"
                />
            </div>
            {error && <p className="error">{error}</p>}
            {isPending && <p className="loading">Loading...</p>}
            {recipes && <RecipeList recipes={recipes} />}
        </div>
    )
}
