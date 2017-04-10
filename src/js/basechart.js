import * as d3 from 'd3';
import * as c from './constants.js';

class BaseChart {
  constructor(rootsel) {
    this.root = d3.select(rootsel);
  }
}

class BeeswarmChart extends BaseChart {

  constructor(rootsel) {
    super(rootsel);
    let margin = {top: 20, right: 20, bottom: 50, left: 20};
    var totalW = 1000;
    var totalH = 600;
    this.W = totalW - margin.left - margin.right;
    this.H = totalH - margin.top - margin.bottom;
    this.R = 25; // radius of circles
    this.svg = this.root.append('svg')
      .attr('width', totalW)
      .attr('height', totalH)
      .style('background-color', 'rgba(240,255,255,1)')
      .append("g")
        .attr("transform", "translate(" + margin.left + " " + margin.top + ")");

    this.xscale = d3.scaleLinear()
      .domain(this.extent)
      .range([this.R, this.W-this.R]);
    this.yscale = d3.scaleLinear()
      .domain([-1, 1])
      .range([this.H-this.R, this.R]);
    this.addAxis();

  }

  addAxis() {
    let h = this.H/2;
    let labelh = h + this.H*5/20;
    this.svg.append("g")
      .classed("axis", true)
      .attr("transform", "translate(0 "+h+")");
    this.svg.append('text')
      .text('Less repetitive')
      .attr('font-size', '13px')
      .attr('x', this.W*1/20)
      .attr('y', labelh);
    this.svg.append('text')
      .text('More repetitive')
      .attr('font-size', '13px')
      .attr('x', this.W*9/10)
      .attr('y', labelh);
    this.updateAxis();
  }

  updateAxis() {
    let axis_el = this.svg.select('.axis');
    let axis = d3.axisBottom(this.xscale).ticks(0);
    axis_el.call(axis);
  }

  bubbleText(textsel, textgetter, fontsize=11) {
    let spans = textsel.selectAll('tspan')
      .data(d=>this.linify(textgetter(d)));
    spans.exit().remove();
    let newspans = spans.enter().append('tspan');
    let lineheight = fontsize*1.05;
    spans.merge(newspans)
      .attr("x", 0)
      .attr("y", (d,i,n) => {
        let nlines = n.length;
        let height = nlines * lineheight;
        // -height/2 would make sense if text grew down from its y-coordinate,
        // but actually, the base of each letter is aligned with the y-coord
        let offset = -height/2 + lineheight/2;
        return offset + i*lineheight;
      })
      .text((d)=>d)
  }
  /** Return a list of word-wrapped lines that sum to the given text.
   * Given max length is treated as a soft constraint. */
  linify(s, maxlen=5) {
    let tokens = s.split(' ');
    let lines = [];
    let line = '';
    console.assert(maxlen > 0);
    let i = 0
    for (let token of tokens) {
      line += token + ' ';
      if (line.length >= maxlen || 
          // look ahead for icebergs
          (line.length && (i+1) < tokens.length && 
            (line.length + tokens[i+1].length) > maxlen * 1.75
          )
         ) {
        lines.push(line.slice(0,-1));
        line = '';
      }
      i++;
    }
    if (line) {
      lines.push(line);
    }
    return lines;
  }

  get extent() {
    return d3.extent(this.currData, this.getx);
  }
  get currData() {
    console.error('subclass must implement');
  }

  getx(datum) {
    console.error('subclass must implement');
  }
  datx(datum) {
    return this.xscale(this.getx(datum));
  }
}

export { BeeswarmChart };