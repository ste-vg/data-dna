import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';
import { TweenMax, Power4, Power1 } from "gsap";

export interface Data
{
    id: string;
    label?: string;
}

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;
    private baseGroup:SVGElement;
    private labelGroup:SVGElement;
    private _width:number = 0;
    private _height:number = 0;
    private lineTop:SVGPathElement;
    private lineBottomOver:SVGPathElement;
    private lineBottomUnder:SVGPathElement;

    private amplitude = 0; // wave amplitude
    private rarity = 0; // point spacing
    private targetFreq = 0.15; // angular frequency
    private freq = 0;
    private phase = 0; 
    private minBaseGap = 0;
    private padding = 10;
    private rotationSpeed = 0;
    private targetRotationSpeed = 0.075;
    private curveResolution = 10;
    private points = 0;
    private maxAmplitude = 40;
    private targetMinY = 10;
    private minY = 10;
    private labelRadius = 0;
    private targetLabelRadius = 8;
    private labelStroke = 0;
    private targetLabelStroke = 4;

    private backBoneWidth = 0;
    private targetBackBoneWidth = 8;

    private showDetails:boolean = true;
    private addBlanks:boolean = true;

    private data: (Data|null)[] = [
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair', label: 'Top Movie Watchers'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair', label: 'Top Personas'},
        { id: 'basePair'},
        { id: 'basePair', label: 'Top Music Listeners'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair'},
        { id: 'basePair', label: 'Longest Flight'},
        { id: 'basePair'}
    ]

    private bases:SVGLineElement[] = [];
    private circles:({element: SVGCircleElement, top:boolean} | null)[] = [];

    constructor(container:Element)
    {
        super('app', HTML, container, () => this.onInit());

        // create elements

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        // 

        this.baseGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.baseGroup);

        // 
        
        this.lineBottomUnder = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomUnder.setAttribute("class", "line bottom");
        this.svg.appendChild(this.lineBottomUnder);

        this.lineTop = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineTop.setAttribute("class", "line top");
        this.svg.appendChild(this.lineTop);

        this.lineBottomOver = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomOver.setAttribute("class", "line bottom dashed");
        this.svg.appendChild(this.lineBottomOver);        

        //

        this.labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.labelGroup);
    }

    private onInit()
    {
        this._container = document.getElementById('root');

        if(this.addBlanks)
        {
            this.data.push(null);
            this.data.unshift(null);
        }
        if(this._container)
        {
            this._container.appendChild(this.svg);
            
            window.addEventListener('resize', () => this.onResize())
            this.onResize();
            let top = true;

            for (let i = 0; i < this.data.length; i++) 
            {
                let base = document.createElementNS("http://www.w3.org/2000/svg", 'line');
                let classString:string = (this.data[i] !== null) ?  this.data[i].id : 'blank';
                base.setAttribute('class', `base ${classString}`);
                this.baseGroup.appendChild(base);
                this.bases.push(base);

                let circle = (this.data[i] && this.data[i].label) ? document.createElementNS("http://www.w3.org/2000/svg", 'circle') : null;
                this.circles.push(circle ? {element: circle, top: top} : null);
                if(circle)
                {
                    this.labelGroup.appendChild(circle);
                    circle.setAttribute('class', `circle ${classString} ${top ? 'top' : 'bottom'}`);
                    circle.setAttribute('r', String(this.labelRadius));
                    top = !top;

                }
            }  
            
            this._container.addEventListener('click', () => this.toggleState())

            this.setDetailsState(this.showDetails);
            requestAnimationFrame(() => this.tick());
        }
    }

    private setDetailsState(state:boolean)
    {
        this.showDetails = state;
        this.onStateChange();
    }

    private toggleState()
    {
        this.setDetailsState(!this.showDetails)
    }

    private onStateChange()
    {
        TweenMax.to(this, this.showDetails ? 3 : 2, {
            backBoneWidth: this.showDetails ? this.targetBackBoneWidth : 0,
            freq: this.showDetails ? this.targetFreq : 0, 
            rotationSpeed: this.showDetails ? this.targetRotationSpeed : 0, 
            minY: this.showDetails ? 0 : this.targetMinY, 
            phase: this.showDetails ? 0 : `+=${(Math.PI * 4) / this.freq}`, 
            labelRadius: this.showDetails ? this.targetLabelRadius : 0, 
            labelStroke: this.showDetails ? this.targetLabelStroke : 0, 
            ease: this.showDetails ? Power4.easeInOut : Power1.easeInOut,
            onComplete: () => {if(!this.showDetails) this.phase = 0;}
        })
    }

    private getY(i:number, direction:number)
    {
        let amp = direction * this.amplitude;
        let minY = direction * this.minY;
        return minY + (Math.sin(this.freq * (i + this.phase)) * amp + (this._height/2));
    }

    private draw()
    {
        let topPath = [];
        let bottomPath = [];

        for (let i = 0; i < this.points; i++) 
        {
            let x = String((i + 1) * this.rarity);
            let y1 = String(this.getY(i, 1));
            let y2 = String(this.getY(i, -1));

            topPath.push([x, y1]);
            bottomPath.push([x, y2]);
        }   

        let gaps = this.points / (this.data.length - 1); 

        for (let i = 0; i < this.data.length; i++) 
        {
            let j = i * gaps;
            let x = String((j + 1) * this.rarity);
            let y1 = String(this.getY(j, 1));
            let y2 = String(this.getY(j, -1));

            let base = this.bases[i];
            base.setAttribute('x1', x);
            base.setAttribute('x2', x);
            base.setAttribute('y1', y1);
            base.setAttribute('y2', y2);

            if(this.circles[i])
            {
                let circle = this.circles[i].element;
                let top = this.circles[i].top;
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', top ? y1 : y2);
                circle.setAttribute('r', String(this.labelRadius));
                circle.style.strokeWidth = String(this.labelStroke);
            }
        }

        let topPathString = '';
        let bottomPathString = '';

        for (let i = 0; i < topPath.length; i++) 
        {
            topPathString += (i == 0 ? 'M' : 'L');
            topPathString += topPath[i].join(' ');

            bottomPathString += (i == 0 ? 'M' : 'L');
            bottomPathString += bottomPath[i].join(' ');
        }

        this.lineTop.setAttribute("d", topPathString);
        this.lineBottomOver.setAttribute("d", bottomPathString);
        this.lineBottomUnder.setAttribute("d", bottomPathString);
        
        this.lineTop.style.strokeWidth = String(this.backBoneWidth);
        this.lineBottomOver.style.strokeWidth = String(this.backBoneWidth);
        this.lineBottomUnder.style.strokeWidth = String(this.backBoneWidth);

        let lineSize = this.lineBottomOver.getTotalLength()
        let curveSize = (lineSize - (lineSize * this.freq)) / Math.PI;
        this.lineBottomOver.style.strokeDasharray = `${curveSize} ${curveSize}`;
        this.lineBottomOver.style.strokeDashoffset = `${(curveSize / 2) + this.rarity * this.phase}`;
    }

    tick()
    {
        this.phase += this.rotationSpeed;
        if(this.phase > (Math.PI * 4) / this.freq) this.phase = 0

        this.draw();
        requestAnimationFrame(() => this.tick());
    }

    onResize()
	{
        if(this._container)
        {
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));

            
            this.points = this.width / this.curveResolution;
            this.amplitude = (this.height - (this.padding * 2)) / 2;
            this.rarity = this.width / this.points;

            if(this.amplitude > this.maxAmplitude) this.amplitude = this.maxAmplitude;
            if(this.rarity < this.minBaseGap) this.rarity = this.minBaseGap;
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };

}