import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import { POINT_TYPES } from '../const.js';

const BLANK_POINT = {
  type: '',
  dateFrom: dayjs().toDate(),
  dateTo: dayjs().toDate(),
  basePrice: 0,
  offers: [],
  destination: {
    name: '',
    description: '',
    pictures: [],
  },
};

const createOfferName = (offer = {}) => {
  let offerName = '';
  switch (offer.title) {
    case 'Add luggage':
      offerName = 'luggage';
      break;
    case 'Switch to comfort':
      offerName = 'comfort';
      break;
    case 'Add meal':
      offerName = 'meal';
      break;
    case 'Choose seats':
      offerName = 'seats';
      break;
    case 'Travel by train':
      offerName = 'train';
      break;
    default:
      offerName = '';
  }

  return offerName;
};

const createPointOfferSelector = (point = {}) => {
  const { offers } = point;
  return offers.map((offer) =>
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${createOfferName(offer)}-1" type="checkbox" name="event-offer-${createOfferName(offer)}" checked>
      <label class="event__offer-label" for="event-offer-${createOfferName(offer)}-1">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`).join('');
};

const createPointSectionOffers = (point) => (
  `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${createPointOfferSelector(point)}
    </div>
  </section>`
);

const createPointSectionDestination = (point) => (
  `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${point.destination.description}</p>
  </section>`
);

const createPointTypeItem = (eventTypes) => {
  const types = Object.values(eventTypes);

  return types.map((type) =>
    `<div class="event__type-item">
      <input id="event-type-taxi-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
        <label class="event__type-label  event__type-label--${type}" for="event-type-taxi-1">${type[0].toUpperCase() + type.substring(1)}</label>
    </div>`).join('');
};

const createScheduleFieldHtml = (point) => {
  const {dateFrom, dateTo} = point;

  return (`
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input
        class="event__input  event__input--time"
        id="event-start-time-1"
        type="text"
        name="event-start-time"
        value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}">
      —
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input
        class="event__input  event__input--time"
        id="event-end-time-1"
        type="text"
        name="event-end-time"
        value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}">
    </div>
  `);
};

const createPriceFieldHtml = (point) => {
  const {basePrice} = point;

  return (`
    <div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-1">
        <span class="visually-hidden">Price</span>
        €
      </label>
      <input
        class="event__input  event__input--price"
        id="event-price-1"
        type="number"
        min="0"
        name="event-price"
        value="${basePrice}">
    </div>
  `);
};

const createSubmitButtonHtml = () =>
  `<button
      class="event__save-btn  btn  btn--blue"
      type="submit">
        Save
    </button>
`;

const createCancelButtonHtml = () =>
  `<button
      class="event__reset-btn"
      type="reset">
        Cancel
    </button>
`;

export const createEditViewTemplate = (point = {}) => {
  const { type, destination, isOffers, isDestination } = point;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createPointTypeItem(POINT_TYPES)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
              <option value="Amsterdam"></option>
              <option value="Geneva"></option>
              <option value="Chamonix"></option>
            </datalist>
          </div>

          ${createScheduleFieldHtml(point)}
          ${createPriceFieldHtml(point)}
          ${createSubmitButtonHtml()}
          ${createCancelButtonHtml()}
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
            ${isOffers ? createPointSectionOffers(point) : ''}
            ${isDestination ? createPointSectionDestination(point) : ''}
          </section>
        </section>
      </form>
    </li>`
  );
};

export default class EditView extends AbstractStatefulView {
  #point = null;
  #handleCloseClick = null;

  constructor({ point = BLANK_POINT, onCloseClick }) {
    super();
    this._state = EditView.parseEventToState(point);
    this.#handleCloseClick = onCloseClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
  }

  get template() {
    return createEditViewTemplate(this._state);
  }

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick(EditView.parseStateToEvent(this._state));
  };

  static parseEventToState(event) {
    return {...event,
      isOffers: event.offers.length > 0,
      isDestination: event.destination
    };
  }

  static parseStateToEvent(state) {
    const event = {...state};
    delete event.isOffers;
    delete event.isDestination;
    return event;
  }
}
