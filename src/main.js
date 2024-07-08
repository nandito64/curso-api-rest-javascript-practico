//data
const api=axios.create({
    baseURL:'https://api.themoviedb.org/3/',
    headers:{
        'Content-Type':'aplicattion/json;charset=utf-8',
    },
    params:{
        'api_key':API_KEY,
    },
});

function likedMoviesList(){
    const item=JSON.parse(localStorage.getItem('liked_movies'));
    let movies;
    if(item){
        movies=item;
    }else{
        movies={};
    }
    return movies;
}
    function likeMovie(movie){
       const likedMovies=likedMoviesList();
       console.log(likedMovies);

        if(likedMovies[movie.id]){
             //remover
             likedMovies[movie.id]=undefined;
         }else{
        //agregar
        likedMovies[movie.id]=movie;
        }
        localStorage.setItem('liked_movies',JSON.stringify(likedMovies));
    }
//Utils
// async function getTrendingMoviesPreview(){
//     const res=await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key='+API_KEY);
//     const data =await res.json();
//     console.log(data);

//     const movies =data.results;


//     movies.forEach(movie => {
        
//         const trendingPreviewMoviesContainer=document.querySelector('#trendingPreview .trendingPreview-movieList');
//        const movieContainer=document.createElement('div'); 
//        movieContainer.classList.add('movie-container');
//        const movieImg=document.createElement('img');
//        movieImg.classList.add('movie-img');
//        movieImg.setAttribute('alt',movie.title);
//        movieImg.setAttribute('src','https://image.tmdb.org/t/p/w300/'+movie.poster_path);
       
//        movieContainer.appendChild(movieImg);
//         trendingPreviewMoviesContainer.appendChild(movieContainer);
//     });
// }

//utils
const lazyLoader=new IntersectionObserver((entries)=>{
       entries.forEach((entry)=>{

        if(entry.isIntersecting){
            const url=entry.target.getAttribute('data-img'); 
            entry.target.setAttribute('src',url);
        }
       
    });
});

function createMovies(
    movies,
    container,
    {lazyLoad=false,clean=true} ={},
    ){

    if(clean){
        container.innerHTML="";
    }
    movies.forEach(movie => {  
        const movieContainer=document.createElement('div'); 
        movieContainer.classList.add('movie-container');

        
        const movieImg=document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt',movie.title);
        // movieImg.setAttribute('src','https://image.tmdb.org/t/p/w300/'+movie.poster_path);
               
        movieImg.setAttribute(
            lazyLoad? 'data-img':'src',
            'https://image.tmdb.org/t/p/w300/'+movie.poster_path);        
        
            movieImg.addEventListener('click',()=>{
                location.hash='#movie='+movie.id;
            });
        movieImg.addEventListener('error',()=>{
            movieImg.setAttribute(
                'src',
                'http://static.platzi.com/static/images/error/img404.png'
            );
        });  
        
        const movieBtn=document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked')
        movieBtn.addEventListener('click',()=>{

            movieBtn.classList.toggle('movie-btn--liked');
            //
            likeMovie(movie);
        });

        if(lazyLoad){
            lazyLoader.observe(movieImg);
        }
        
        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
     });
}

function createCategories(categories,container){
    container.innerHTML="";
    categories.forEach(category => {
        const categoryContainer=document.createElement('div'); 
        categoryContainer.classList.add('category-container');
 
        const categoryTitle=document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id','id'+category.id);
        
        //
        categoryTitle.addEventListener('click',()=>{
         location.hash=`#category=${category.id} - ${category.name}`;
        });
 
        const categoryTitleText=document.createTextNode(category.name);
 
        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
     });

}
// llamados a las APIS
async function getTrendingMoviesPreview(){
    const {data}=await api('trending/movie/day');
    console.log(data);
    const movies =data.results;

    createMovies(movies,trendingMoviesPreviewList,true);
}

async function getCategoriesPreview(){
    const {data}=await api('genre/movie/list');
    console.log(data);
    const categories =data.genres;

    createCategories(categories,categoriesPreviewList);
        
}

async function getMoviesByCategory(id){
    const {data}=await api('discover/movie',{
        params:{
            with_genres:id,
        }
    });
    const movies =data.results;
    maxPage=data.total_pages;
    createMovies(movies,genericSection,{laziLoad:true});
}

function getPaginatedMoviesByCategory(id){

    return async function(){
      const { 
          scrollTop,
          scrollHeight,
          clientHeight
      }=document.documentElement;
  
     const scrollIsBotton= (scrollTop+clientHeight)>=(scrollHeight-15);
  
     const pageIsNotMax=page<maxPage;
  
     if(scrollIsBotton&&pageIsNotMax){
      page++;
      const {data}=await api('discover/movie',{
          params:{
              with_genres:id,
              page,
          }
      });
      const movies =data.results;
      createMovies(movies,genericSection,{lazyLoad:true, clean:false});
     }
    }
  }

async function getMoviesBySearch(query){
    const {data}=await api('search/movie',{
        params:{
            query,
        },
    });
    const movies =data.results;

    maxPage=data.total_pages;
    console.log('hhh');
    console.log(maxPage);
    createMovies(movies,genericSection);
}
function getPaginatedmoviesBySearch(query){

  return async function(){
    const { 
        scrollTop,
        scrollHeight,
        clientHeight
    }=document.documentElement;

   const scrollIsBotton= (scrollTop+clientHeight)>=(scrollHeight-15);

   const pageIsNotMax=page<maxPage;

   if(scrollIsBotton&&pageIsNotMax){
    page++;
    const {data}=await api('search/movie',{
        params:{
            query,
            page,
        }
    });
    const movies =data.results;
    createMovies(movies,genericSection,{lazyLoad:true, clean:false});
   }
  }
}

async function getTrendingMovies(){
    const {data}=await api('trending/movie/day');
    const movies =data.results;

    maxPage=data.total_pages;

    createMovies(movies,genericSection,{lazyLoad:true, clean:true});

    // const btnLoadMore=document.createElement('button');
    // btnLoadMore.innerText='Cargar mas';
    // btnLoadMore.addEventListener('click',getPaginatedTrendigMovies);
    // genericSection.appendChild(btnLoadMore);
}

// window.addEventListener('scroll',getPaginatedTrendigMovies);


async function getPaginatedTrendigMovies(){

    const { 
        scrollTop,
        scrollHeight,
        clientHeight
    }=document.documentElement;

   const scrollIsBotton= (scrollTop+clientHeight)>=(scrollHeight-15);

   const pageIsNotMax=page<maxPage;

   if(scrollIsBotton&&pageIsNotMax){
    page++;
    const {data}=await api('trending/movie/day',{
        params:{
            page,
        },
        
    });
    const movies =data.results;

    createMovies(movies,genericSection,{lazyLoad:true, clean:false});
   }
}

    

async function getMovieById(id){
    const {data:movie}=await api('movie/'+id);

    const movieImgUrl='https://image.tmdb.org/t/p/w500'+movie.poster_path;
    headerSection.style.background=`
    url(${movieImgUrl}),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%,
    rgba(0,0,0,0) 29.17%
    )`;

    movieDetailTitle.textContent=movie.title;
    movieDetailDescription.textContent=movie.overview;
    movieDetailScore.textContent=movie.vote_average;

    createCategories(movie.genres,movieDetailCategoriesList);
    getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id){
    const {data}=await api(`movie/${id}/recommendations`);
    const relatedMovies=data.results;
    console.log('relatedMovies');

    console.log(relatedMovies);
    createMovies(relatedMovies,relatedMoviesContainer);
}

function getLikedMovies(){
    const likedMovies=likedMoviesList();
    const moviesArray=Object.values(likedMovies);
    createMovies(moviesArray,likedMoviesListArticle,{lazyLoad:true,clean:true});
    console.log(likedMovies);
}

