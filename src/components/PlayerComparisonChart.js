import React, { useState, useEffect } from "react";
import axios from "axios";
import cheerio from "cheerio";
import * as d3 from "d3";

const PlayerCompareisonChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        "https://trueimperium.com/https://www.messivsronaldo.app/"
      );
      const $ = cheerio.load(result.data);
      const messiGoals = parseInt(
        $(".StatsBlock-module--goals--NKbmt .StatsBlock-module--statNum--1Tu-D")
          .first()
          .text()
      );
      const ronaldoGoals = parseInt(
        $(".StatsBlock-module--goals--NKbmt .StatsBlock-module--statNum--1Tu-D")
          .eq(1)
          .text()
      );
      console.log(ronaldoGoals);
      console.log(messiGoals);
      setData([
        { name: "Messi", goals: messiGoals },
        { name: "Ronaldo", goals: ronaldoGoals },
      ]);
    };
    fetchData();
  }, []);

  // logic to plot data using d3.js
  useEffect(() => {
    if (data.length === 0) return;

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 40, bottom: 50, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    const x = d3.scaleBand().range([0, width]).padding(0.5);
    const y = d3.scaleLinear().range([height, 0]);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    d3.select("#chart").select("svg").remove();
    const tooltip = d3.select("#tooltip");

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain(data.map((d) => d.name));
    y.domain([0, d3.max(data, (d) => d.goals)]);

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(0))
      .attr("height", 0)
      .style("fill", (d) => (d.name === "Messi" ? "blue" : "red"))
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`Goals: ${d.goals}`)
          .style("background-color", d.name === "Messi" ? "blue" : "red")
          .style("color", "white")
          .style("padding", "4px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("y", (d) => y(d.goals))
      .attr("height", (d) => height - y(d.goals));

    // append the rectangles for the bar chart
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(0))
      .attr("height", 0)
      .style("fill", (d) => (d.name === "Messi" ? "blue" : "red"))
      .transition()
      .duration(1000)
      .attr("y", (d) => y(d.goals))
      .attr("height", (d) => height - y(d.goals));

    // add the x Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // add the x Axis label
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + "," + (height + margin.bottom / 1.5) + ")"
      )
      .style("text-anchor", "middle")
      .text("Player");

    // add the y Axis
    svg.append("g").call(d3.axisLeft(y));

    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    // add the y Axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of goals");

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .style("fill", (d) => (d.name === "Messi" ? "blue" : "red"));

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text((d) => `Goals for ${d.name}`);
  }, [data]);

  return (
    <div>
      <div id="chart"></div>
      <div id="tooltip" style={{ opacity: 0, position: "absolute" }}></div>
    </div>
  );
};

export default PlayerCompareisonChart;
