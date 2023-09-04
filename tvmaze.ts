import axios from "axios";
import jQuery, { get } from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");
const BASE_URL = "http://api.tvmaze.com/";
const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: string,
}

interface ShowResultsInterface {
  id: number,
  name: string,
  summary: string,
  image: { medium: string; } | null;
};

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string,
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowInterface[]> {

  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  console.log("response", response);
  //const data : ShowResultsInterface[] = response.data
  const result = response.data.map(showDetails => ({
    id: showDetails.show.id,
    name: showDetails.show.name,
    summary: showDetails.show.summary,
    image: showDetails.show.image
  }));
  console.log("result", result);
  return result;

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= ${show.image?.medium || MISSING_IMAGE_URL}
              alt= ${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val();
  const shows = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

/** Searches for a show and displays relevant shows. */

$searchForm.on("submit", async function (evt): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {

  const response = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  console.log('***response', response);

  const result = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return result;
}

/** Get a show and populate a list with the episodes. */

function populateEpisodes(episodes: EpisodeInterface[]) {
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(`
    <li>${episode.name} (season ${episode.season},
    number ${episode.number})</li>
    `);
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** gets episodes and populates the dom with episode data*/

async function getEpisodesAndShowDom(evt: JQuery.ClickEvent){
  const id = $(evt.target).closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

/** handles click for Episodes
 * displays episode to DOM
 */

 $showsList.on('click', 'button', getEpisodesAndShowDom);