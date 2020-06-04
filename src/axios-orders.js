import axios from 'axios';

const instance = axios.create({
	baseURL: 'https://react-myburger-182b6.firebaseio.com/'
});

export default instance;