import { createElement } from './dom.js';
import { MyEventSystem } from "./event.js";
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.initEventListeners();
    }


    initEventListeners() {
        MyEventSystem.addEventListener(window,'popstate',() => {
            this.handleRouting();
        })
        // document.addEventListener('click', (e) => {
        //     if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
        //         e.preventDefault();
        //         this.navigate(e.target.getAttribute('href'));
        //     }
        // });
    }

    navigate(path) {
        history.pushState({}, '', path);
        this.handleRouting();
    }

    handleRouting() {
        const path = window.location.pathname;
        const route = this.routes[path];
        
        if (route) {
            const body = document.body;
            body.innerHTML = '';
            const routeComponents = route();            
            routeComponents.forEach(component => {
                body.appendChild(createElement(component));
            });
            this.currentRoute = path;
        } else {
            console.log('Route not found');
            
            this.handle404();
        }
    }

    handle404() {
        const body = document.body
        body.innerHTML = `
        <div class="not-found-container">
            <h1 class="not-found-title">404</h1>
            <p class="not-found-text">Page Nout found</p>
            <a href="/" class="home-link">Go Home</a>
        </div>
    `

        document.querySelector('.home-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate
        })
    }

    init() {
        this.handleRouting();
    }
}