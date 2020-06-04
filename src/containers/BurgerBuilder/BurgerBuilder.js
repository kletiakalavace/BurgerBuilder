import React, { Component } from 'react';

import Ax from '../../hoc/Ax/Ax';
import Burger from '../../components/Burger/Burger';
import BuildControls from'../../components/Burger/BuildControls/BuildControls';
import Modal from'../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';


const INGRIDIENT_PRICES = {
	cheese: 0.4,
	meat: 1.3,
	bacon: 0.7,
	green_salad:0.3,
    cesar_salad: 0.7,
    tuna_salad: 0.9,
    salad: 0.4,
};

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {...}
    // }
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable:false,
        purchasing:false,
        loading:false,
        error:false
    };
    componentDidMount = () => {
        axios.get('https://react-myburger-182b6.firebaseio.com/ingredients.json')
             .then(response =>{
                this.setState({ingredients : response.data});
             })
             .catch(error => {
                this.setState({error:true})
             });
    };

    updatePurchaseState(ingredients) {
    	const sum = Object.keys(ingredients)
    		.map(igKey =>{
    			return ingredients[igKey];
    		})
    		.reduce((sum, el) =>{
    			return sum + el;
    		}, 0);
    	this.setState({purchasable: sum > 0})
    }
    addIngridientHandler = (type) =>{
    	const oldCount = this.state.ingredients[type];
    	const updateCount = oldCount + 1;
    	const updateIngradients = {
    		...this.state.ingredients
    	};
    	updateIngradients[type] = updateCount;
    	const priceAddition = INGRIDIENT_PRICES[type];
    	const oldPrice = this.state.totalPrice;
    	const newPrice = oldPrice + priceAddition;
    	this.setState({totalPrice:newPrice,ingredients:updateIngradients});
    	this.updatePurchaseState(updateIngradients);
    }

    removeIngridientHandler = (type) =>{
    	const oldCount = this.state.ingredients[type];
    	if(oldCount <= 0){
    		return;
    	}
    	const updateCount = oldCount - 1;
    	const updateIngradients = {
    		...this.state.ingredients
    	};
    	updateIngradients[type] = updateCount;
    	const priceDeduction = INGRIDIENT_PRICES[type];
    	const oldPrice = this.state.totalPrice;
    	const newPrice = oldPrice - priceDeduction;
    	this.setState({totalPrice:newPrice,ingredients:updateIngradients});
    	this.updatePurchaseState(updateIngradients);
    }

    purchaseHandler = () =>{
    	this.setState({purchasing: true});
    }

    purchaseCancelHandler = () =>{
    	this.setState({purchasing: false});
    }

     purchaseContinueHandler = () =>{
    	//alert('You continue!');
       
        const queryParams = [];
        for(let i in this.state.ingredients){
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
        }
        queryParams.push('price=' + this.state.totalPrice);
        const queryString = queryParams.join('&');

        this.props.history.push({
            pathname:'/checkout',
            search:'?' + queryString,
        });
    }
    render () {
    	const disabledInfo ={
    		...this.state.ingredients
    	};
    	for(let key in disabledInfo){
    		disabledInfo[key] = disabledInfo[key] <= 0;
    	};

        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded </p> : <Spinner />;

        if(this.state.ingredients){
            burger = (
                <Ax>
                  <Burger ingredients={this.state.ingredients} />
                   <BuildControls 
                      ingridientAdded= {this.addIngridientHandler} 
                      ingridientRemoved= {this.removeIngridientHandler} 
                      disabled = {disabledInfo}
                      purchasable = {this.state.purchasable}
                      ordered = {this.purchaseHandler}
                      price = {this.state.totalPrice}/>
                </Ax>
            );

            orderSummary =  <OrderSummary 
                ingredients ={this.state.ingredients}
                price ={this.state.totalPrice}
                purchaseCancelled ={this.purchaseCancelHandler}
                purchaseContinued ={this.purchaseContinueHandler}/>;


            if(this.state.loading){
                  orderSummary = <Spinner />;
            }
          }

        return (
            <Ax>
            	<Modal show ={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
            	   {orderSummary}
            	 </Modal>
                {burger}
            </Ax>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);