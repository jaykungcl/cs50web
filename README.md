# UMAI: Personalized Recipe Directory

#### Distinctiveness and Complexity
- ***Distinctiveness***: This project is not in any way an online encyclopedia, mail service, e-commerce site, or social media. UMAI is an online platform with user authentication service to explore cooking recipes, save your favorites, and also create your own recipes.
- ***Complexity***: This project had utilized Django with multiple models on the back-end and React on the front-end. There is an implementation of user authentication system, image uploading to sqlite3 database, user profile, like system, dynamic  web content with query search, and mobile-responsive built in a form of single-page application.

***UMAI*** is a web application for storing recipes from users which let you create and publish your own recipes, save your personal favorite recipes that you can access anywhere with an internet.

This application came from an idea to utilize Django application to manage data ob the back-end and using React application on the front-end to handle dynamic content display.

Without using external APIs, my answer is to build an application for personalized data collection. I ended up with recipe directory because, first of all, I love to cook, and though maybe it is a good idea to build an application that you can store your own recipe and can also view other’s recipes as well.

Every UI components in this application rendered from JSX code in React with dynamic content from fetch API that get data from Django sqlite3 database.

##### Pages structure
- Signup: Signup user with a feature to choose profile picture foe user avatar (if user did not upload file, picture will be set to default picture)
- Login: Login with credentials of existing user
- All: After logged in, user will be presented with home page that initially show all recipes. With an additional search feature, user can type in query string for realtime content update that match with search term.
- Recipe(s): Every recipe has it’s own page with all the details from user input, there are also a like button on top-left corner that let user save recipes to their own favorite page.
- Create: Let user create new recipe and post on the site.
- Favorite: Show all recipes that user had save to their favorite.
- Profile: Show user’s avatar with all recipes of the user.

##### Files structure
- project: main application of Django project.
- apis: Django application, apis for user and recipes data.
- env: python virtual environment to install necessary dependencies and run for development/debugging.
- frontend: React application for responsive single-page UI.
- media: media root directory for photo uploaded to database.

How to run this application?
- This project has not yet been deployed onto the internet (Due to the complexity of deployment of dynamic web application) but you can run it on your own computer by following these steps

1. Download this code either by using git clone or direct download 
2. Install all dependencies by
    - In project directory run: pip install -r requirements.txt
    - In frontend folder run: npm install
3. Run Django application in main folder: python3 manage.py runserver