import { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFetch } from "../../hooks/useFetch";

// styles
import './Create.css'

export default function Create() {
    const [title, setTitle] = useState('');
    const [cookingTime, setCookingTime] = useState('')
    const [newIngredient, setNewIngredient] = useState('')
    const [ingredients, setIngredients] = useState([])
    const [method, setMethod] = useState('')

    const { user } = useAuthContext();
    const { postData, data } = useFetch('http://localhost:8000/api/recipes', 'POST')
    const history = useHistory();
    const ingredientInput = useRef(null);

    useEffect(() => {
        if (data) {
        history.push('/')
        }
    }, [data, history])

    

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log('submit')
        postData({ 
            title, 
            cooking_time: cookingTime,
            ingredients: { "ingredients": ingredients },
            method,
            created_by: user
        })
    }

    const handleAdd = (e) => {
        e.preventDefault();
        const ing = newIngredient.trim();

        if(ing && !ingredients.includes(ing)) {
            setIngredients((prev) => [...prev, newIngredient]) 
        }
        console.log('ingredient added')
        setNewIngredient('');
        ingredientInput.current.focus();
        
    }

    return (
        <div className="create">
            <h2 className="page-title">Create a New Recipe</h2>

            <form onSubmit={handleSubmit}>

                <label>
                    <span>Recipe title:</span>
                    <input 
                        required
                        type="text" 
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />
                </label>

                <label>
                    <span>Recipe ingredients:</span>
                    <div className="ingredients">
                        <input 
                            type="text" 
                            onChange={(e) => setNewIngredient(e.target.value)}
                            value={newIngredient}
                            ref={ingredientInput}
                        />
                        <button onClick={handleAdd} className="btn">Add</button>
                    </div>
                    
                </label>
                <p>Current ingredients: {ingredients.map(
                    ing => <em key={ing}>{ing}, </em>
                )}</p>

                <label>
                    <span>Recipe method:</span>
                    <textarea
                        required
                        onChange={(e) => setMethod(e.target.value)}
                        value={method}
                    ></textarea>
                </label>

                <label>
                    <span>Cooking time (minutes):</span>
                    <input 
                        required
                        type="number" 
                        onChange={(e) => setCookingTime(e.target.value)}
                        value={cookingTime}
                    />
                    <p>(Number in minute(s) only)</p>
                </label>

                <button className="btn">Submit</button>

            </form>
        </div>
    )
}