import './app.scss';
import Image_Me from './me.png';
import HTML from './app.html';
import { Component } from '../common/component';

export class App extends Component
{
    constructor(container:Element)
    {
        super('app', HTML, container, () => this.onInit());
    }

    private onInit()
    {
        var myFace = new Image();
        myFace.src = Image_Me;
        this.container.appendChild(myFace);
    }
}