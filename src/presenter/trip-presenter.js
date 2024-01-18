import { remove, render, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NoPointView from '../view/no-point-view.js';
import PointListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';
import TripView from '../view/trip-view.js';
import { sortPointsByPrice, sortPointsByTime, sortPointsByDay } from '../utilities.js';
import { SortType, UserAction, UpdateType } from '../const.js';


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
  #currentSortType = SortType.DAY;

  constructor({ tripContainer, pointsModel, destinationsModel, offersModel }) {
    this.#tripContainer = tripContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#points = [...this.#pointsModel.points];

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...this.#points.sort(sortPointsByTime)];
      case SortType.PRICE:
        return [...this.#points.sort(sortPointsByPrice)];
      case SortType.DAY:
        return [...this.#points.sort(sortPointsByDay)];
    }

    return this.#pointsModel.points;
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#renderTrip();
  }

  #clearTrip(resetSortType = false) {
    this.#clearPointsList();
    remove(this.#sortComponent);
    this.#sortComponent = null;

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }

    if (this.#noPointViewComponent) {
      remove(this.#noPointViewComponent);
    }
  }

  #renderTrip() {
    if (this.#pointsModel.length === 0) {
      this.#renderNoPoints();
    } else {
      this.#renderTripView();
      this.#renderSort();
      this.#renderPointsListView();
      this.#renderPoints(this.points);
    }
  }

  #renderNoPoints() {
    render(this.#noPointViewComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderTripView() {
    render(this.#tripViewComponent, this.#tripContainer);

    const points = this.points;
    const pointsCount = points.length;

    if (pointsCount === 0) {
      this.#renderNoPoints();
    }

    render(this.#pointListViewComponent, this.#tripViewComponent.element);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPointsListView() {
    render(this.#pointListViewComponent, this.#tripContainer);
  }

  #renderPoints = (points) => {
    points.forEach((point) => {
      this.#renderPoint(point);
    });
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListViewComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearTrip();
        this.#renderTrip();
        break;
      case UpdateType.MAJOR:
        this.#clearTrip({resetSortType: true});
        this.#renderTrip();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#clearTrip();
    this.#renderTrip();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }
}

