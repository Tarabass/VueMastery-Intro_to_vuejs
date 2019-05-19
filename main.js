var eventBus = new Vue()

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s)</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name">
            </p>
            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            <p>
                <p>Would you recommend this product?</p>
                <label for="true">Yes</label>
                <input id="true" type="radio" name="recommend" value="Yes" v-model="recommend" checked>
                <label for="false">No</label>
                <input id="false" type="radio" name="recommend" value="No" v-model="recommend">
            <p>
                <input type="submit" value="Submit">
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors.length  = 0
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend,
                }
    
                eventBus.$emit('review-submitted', productReview)
    
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            }
            else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating  required.")
                if(!this.recommend) this.errors.push("Recommendation  required.")
            }
        }
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
            <img v-bind:src="image">
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p v-if="inventory > 10">In Stock</p>
                <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
                <p v-else v-bind:class="{ outOfStock: inventory === 0 }">Out of Stock</p>
                <info-tabs :shipping="shipping" :details="details"></info-tabs>
                <div v-for="(variant, index) in variants"
                    v-bind:key="variant.variantId"
                    class="color-box"
                    v-bind:style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)">
                </div>
                <button v-on:click="addToCart"
                        v-bind:disabled="inventory === 0"
                        v-bind:class="{ disabledButton: inventory === 0 }">
                    Add to Cart
                </button>
                <button v-on:click="removeFromCart">
                    Remove from Cart
                </button>
            </div>
            <product-tabs :reviews="reviews" :details="details"></product-tabs>
        </div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            variants: [{
                variantId: 2234,
                variantColor: "green",
                variantImage: './assets/vmSocks-green.jpg',
                variantQuantity: 2
            }, {
                variantId: 2235,
                variantColor: "blue",
                variantImage: './assets/vmSocks-blue.jpg',
                variantQuantity: 0
            }],
            reviews: []
        }
    },
    methods: {
        addToCart: function() {
            this.variants[this.selectedVariant].variantQuantity--
            // Fire event to trigger the method defined in the HTML tag
            this.$emit('update-cart', this.variants[this.selectedVariant].variantId, true)
        },
        removeFromCart: function() {
            const quantity = this.variants[this.selectedVariant].variantQuantity
            
            if(quantity > 0) {
                this.variants[this.selectedVariant].variantQuantity++
                // Fire event to trigger the method defined in the HTML tag
                this.$emit('update-cart', this.variants[this.selectedVariant].variantId, false)
            }
        },
        updateProduct: function(index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inventory() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if(this.premium) {
                return 'Free'
            }
    
            return 2.99
        }
    },
    // life cycle hook
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                v-bind:class="{ activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs"
                :key="index"
                @click="selectedTab = tab">
                {{ tab }}
            </span>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <li v-for="(review, index) in reviews" :key="index">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>
            <product-review v-show="selectedTab === 'Make a Review'"></product-review>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('info-tabs', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <ul>
                <span class="tabs" 
                        :class="{ activeTab: selectedTab === tab }"
                        v-for="(tab, index) in tabs"
                        @click="selectedTab = tab"
                        :key="tab"
                >{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Shipping'">
                <p>{{ shipping }}</p>
            </div>
            <div v-show="selectedTab === 'Details'">
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id, add) {
            if(add)
                this.cart.push(id)
            else
                this.cart.pop(id)
        }
    }
})