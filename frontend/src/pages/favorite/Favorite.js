import RecipeList from '../../components/RecipeList'
import { useFetch } from '../../hooks/useFetch'
import './Favorite.css'

export default function Favorite() {
    const { error, isPending, data } = useFetch(`http://127.0.0.1:8000/api/recipes/favorite`);

    return (
        <div className="favorite">
            <h2>Favorites</h2>
            {error && <p className="error">{error}</p>}
            {isPending && <p className="loading">Loading...</p>}
            {data && <RecipeList recipes={data} />}
        </div>
    )
}