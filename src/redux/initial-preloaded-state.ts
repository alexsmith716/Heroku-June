import { Request } from 'express';
import { State as DeviceState } from './modules/device';

//  type Props = {
//  	device?: DeviceState;
//  	counterPreloaded?: number;
//  };
//
//  export default (req: Request, { device, counterPreloaded }: Props)  => ({
export default (req: Request, device: DeviceState, counterPreloaded: number) => ({
	device: {
		userAgent: req['userAgent'],
		isBot: req['isBot'],
	},

	counterPreloaded: {
		counterPreloadedState: req['counterPreloadedState'],
	},
});
