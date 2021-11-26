import { useState } from 'react';
import { useParams } from 'react-router';
import Avatar from '../../components/Avatar';
import RecipeList from '../../components/RecipeList';
import { useAuthContext } from '../../hooks/useAuthContext'
import { useFetch } from '../../hooks/useFetch';
import './User.css'

export default function User() {
    const [url, setUrl] = useState('')
    const { user } = useAuthContext();

    const { id } = useParams();
    // const { error, isPending, data: recipes } = useFetch(url);
    const { error, isPending, data: recipes } = useFetch(`http://127.0.0.1:8000/api/user/${id}`);
    console.log(recipes, typeof user.id)
    return (

        <div className="profile">
            <div className="profile-header">
                <Avatar src={user.img_url} />
                <div className="text-content">
                    <h2>Profile: {user.username}</h2>
                    <p>Recipe: {recipes && recipes.reduce((num, recipe) => {
                        return num + (recipe.created_by_id == user.id ? 1: 0);
                    }, 0)}</p>
                </div>
                
            </div>

            {recipes && <RecipeList recipes={recipes} />}
        </div>

    )
}
