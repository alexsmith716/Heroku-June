import { fetchBridgeRatings } from '../../containers/NYCBridgeRatings/fetchBridgeRatings';

const LOAD = 'redux-example/nycBridgeRatings/LOAD';
const LOAD_SUCCESS = 'redux-example/nycBridgeRatings/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/nycBridgeRatings/LOAD_FAIL';

export type Actions = { type: typeof LOAD } | { type: typeof LOAD_SUCCESS } | { type: typeof LOAD_FAIL };

export type State = {
	loading: boolean;
	loaded: boolean;
	error: true | null;
	errorResponse: any;
	data: any;
};

export const initialState: State = {
	loading: false,
	loaded: false,
	error: null,
	errorResponse: null,
	data: null,
};

type LoadActions = {
	type: string[];
	types: string[];
	promise: () => Promise<void>;
};

export const reducer = (state: State = initialState, action: Actions): State => {
	switch (action.type) {
		case LOAD:
			return {
				...state,
				loading: true,
			};

		case LOAD_SUCCESS:
			return {
				...state,
				loading: false,
				loaded: true,
				data: action,
			};

		case LOAD_FAIL:
			return {
				...state,
				loading: false,
				loaded: false,
				error: true,
				errorResponse: action,
			};

		default:
			return state;
	}
};

export function loadNYCBridgeRatings(): LoadActions {
	return {
		type: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
		types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
		promise: () => fetchBridgeRatings(),
	};
}
