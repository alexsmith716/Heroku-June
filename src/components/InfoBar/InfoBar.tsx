import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadInfo } from '../../redux/modules/info';
import { State as InfoState } from '../../redux/modules/info';
import { Loading } from '../Loading';
import Button from '../Button';
import * as Styles from './styles';

// https://redux.js.org/usage/usage-with-typescript
// https://react-redux.js.org/using-react-redux/usage-with-typescript

export type State = {
	info: InfoState;
};

export const InfoBar: React.FC = () => {
	const dispatch = useDispatch();

	const loading = useSelector((state: State) => state.info.loading);
	const error = useSelector((state: State) => state.info.error);
	const errorResponse = useSelector((state: State) => state.info.errorResponse);
	const data = useSelector((state: State) => state.info.data);

	const doLoadInfo = async (): Promise<void> => {
		try {
			await dispatch(loadInfo());
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div className="container">
			<Styles.InfoBarContainerBgColor className="flex-column align-items-center mb-5">
				<Styles.InfoBarContainer className="flex-column align-items-center">
					{/* (>>>>>>>>>>>>>>>>>>>>>> LOADING >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{loading && <Loading text="Loading" />}

					{/* (>>>>>>>>>>>>>>>>>>>>>> ERROR >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{error && (
						<>
							<div>ERROR!</div>
							<div>{`${errorResponse.error.message}`}</div>
						</>
					)}

					{/* (>>>>>>>>>>>>>>>>>>>>>>>> LOADED >>>>>>>>>>>>>>>>>>>>>>>>) */}
					{!loading && (
						<Styles.InfoBarContainerStyled className="flex-column-center">
							<div>
								InfoBar message: &apos;
								<Styles.DataMessage>
									{data ? data.result.message : 'no message!'}
								</Styles.DataMessage>
								&apos;
							</div>
							<div>{data && new Date(data.result.time).toString()}</div>

							<div className="mt-2">
								<Button
									className="btn-primary btn-md"
									onClick={doLoadInfo}
									buttonText="Reload from mockAPI"
								/>
							</div>
						</Styles.InfoBarContainerStyled>
					)}
				</Styles.InfoBarContainer>
			</Styles.InfoBarContainerBgColor>
		</div>
	);
};
