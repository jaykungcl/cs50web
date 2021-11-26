import { Link } from 'react-router-dom'


// styles
import './RecipeList.css'

// components
import Avatar from './Avatar'
import { useFetch } from '../hooks/useFetch'

export default function RecipeList({ recipes }) {

    return (
        <div className="recipe-list">
            {recipes.map((recipe) => (
                <div key={recipe.id} className="card">
                    <div className="head">
                        <h2>{recipe.title}</h2>
                        <div className="user">
                            <span>By {recipe.created_by}</span>
                            <Avatar src={recipe.img_url} />
                        </div>
                    </div>
                    
                    <p>{recipe.cooking_time} to make.</p>
                    <div className="method">{recipe.method.substring(0, 100)}...</div>
                    <Link to={`/recipes/${recipe.id}`}>Cook This</Link>
                </div>
            ))}
        </div>
    )
}
