import { Store, AnyAction } from 'redux';
import { isInfoAlertThreeLoaded, loadInfoAlertThree } from '../../redux/modules/infoAlertThree';

async function preloadData(store: Store): Promise<void> {
	const infoAlertThreeLoaded = isInfoAlertThreeLoaded(store.getState().infoAlertThree);
	if (!infoAlertThreeLoaded) {
		await store.dispatch<AnyAction>(loadInfoAlertThree());
	}
}

export { preloadData };
