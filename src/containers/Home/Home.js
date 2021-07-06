import React, { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { NavLinks } from '../../components/NavBar/NavLinks';
import * as Styles from './styles';

const reducer = (int, action) => {
	int >= NavLinks.length-1 ? int = -1 : null
	switch(action.type) {
		case 'incrementNavLink':
			return int + 1;
		default:
			return int;
	}
}

const Home = () => {

	const [int, dispatch] = useReducer(reducer, 0);
	const [linkUrl, setLinkUrl] = useReducer('');

	useEffect(() => {
			setInterval(() => {
				dispatch({type: 'incrementNavLink'});
			}, 2500);
		},
		[]
	);

	return (
		<>
			<Helmet title="Home" />

			{/* ---------------------------------------------- */}

			<Styles.Masthead className="mb-5">
				<div className="container">
					<Styles.MastheadHeadingOne>Alex Smith's App</Styles.MastheadHeadingOne>

					<Styles.MastheadHeadingTwo>
						Showcasing Examples Of Modern Web Development
					</Styles.MastheadHeadingTwo>

					<Styles.MastheadBlurb>Interested in challenging JavaScript?</Styles.MastheadBlurb>

					<Styles.MastheadBlurbElipsis>... check it out today.</Styles.MastheadBlurbElipsis>

					<Styles.MastheadLink
						className="btn btn-lg btn-success"
						to={`/${NavLinks[int].url}`}
					>
						Go To {`${NavLinks[int].title}`}
					</Styles.MastheadLink>
	
				</div>
			</Styles.Masthead>

			{/* ---------------------------------------------- */}

			<div className="container">
				<div className={`mb-5 card-container-grid`}>
					<div className="container-padding-border-radius-2">
						<div>
							<h4>Card Title 1</h4>
							<div>
								<p>
									Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac
									cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo
									sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed
									odio dui.
								</p>
							</div>
							<div>
								<a href="#">More Info</a>
							</div>
						</div>
					</div>

					<div className="container-padding-border-radius-2">
						<div>
							<h4>Card Title 2</h4>
							<div>
								<p>
									Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac
									cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo
									sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed
									odio dui.
								</p>
							</div>
							<div>
								<a href="#">More Info</a>
							</div>
						</div>
					</div>

					<div className="container-padding-border-radius-2">
						<div>
							<h4>Card Title 3</h4>
							<div>
								<p>
									Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac
									cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo
									sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed
									odio dui.
								</p>
							</div>
							<div>
								<a href="#">More Info</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Home;
