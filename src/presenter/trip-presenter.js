import { render, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NoPointView from '../view/no-point-view.js';
import PointListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';
import TripView from '../view/trip-view.js';
import { updateItem, sortPointsByPrice, sortPointsByTime, sortPointsByDay } from '../utilities.js';
import { SORT_TYPES } from '../const.js';


export default class TripPresenter {
  #tripContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #tripViewComponent = new TripView();
  #pointListViewComponent = new PointListView();
  #sortComponent = null;
  #noPointViewComponent = new NoPointView();

  #points = [];
  #pointPresenters = new Map();
  #currentSortType = SORT_TYPES.DAY;
  #sourcedPoints = [];

  constructor({ tripContainer, pointsModel, destinationsModel, offersModel }) {
    this.#tripContainer = tripContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#points = [...this.#pointsModel.points];
    this.#sourcedPoints = [...this.#pointsModel.points];
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#renderTrip();
  }

  #renderTrip() {
    if (this.#pointsModel.length === 0) {
      this.#renderNoPoints();
    } else {
      this.#renderTripView();
      this.#renderSort();
      this.#renderPointsListView();
      this.#renderPoints();
    }
  }

  #renderNoPoints() {
    render(this.#noPointViewComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderTripView() {
    render(this.#tripViewComponent, this.#tripContainer);
  }

  #renderSort() {
    this.#sortComponent = new SortView({ onSortTypeChange: this.#handleSortTypeChange });
    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPointsListView() {
    render(this.#pointListViewComponent, this.#tripContainer);
  }

  #renderPoints() {
    for (const point of this.#points) {
      this.#renderPoint(point);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListViewComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case SORT_TYPES.TIME:
        this.#points.sort(sortPointsByTime);
        break;
      case SORT_TYPES.PRICE:
        this.#points.sort(sortPointsByPrice);
        break;
      case SORT_TYPES.DAY:
        this.#points.sort(sortPointsByDay);
        break;
      default:
        this.#points = [...this.#sourcedPoints];
    }

    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#clearPointsList();
    this.#renderPoints();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#sourcedPoints = updateItem(this.#sourcedPoints, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}

