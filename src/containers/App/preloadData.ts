import { Store, AnyAction } from 'redux';
import { isInfoLoaded, loadInfo } from '../../redux/modules/info';
import { isInfoAlertLoaded, loadInfoAlert } from '../../redux/modules/infoAlert';

async function preloadData(store: Store): Promise<void> {
	const infoLoaded = isInfoLoaded(store.getState().info);
	if (!infoLoaded) {
		await store.dispatch<AnyAction>(loadInfo());
	}

	const infoAlertLoaded = isInfoAlertLoaded(store.getState().infoAlert);
	if (!infoAlertLoaded) {
		await store.dispatch<AnyAction>(loadInfoAlert());
	}
}

export { preloadData };
