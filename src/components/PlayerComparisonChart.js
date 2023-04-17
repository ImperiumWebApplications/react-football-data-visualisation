import React, { useState, useEffect } from "react";
import axios from "axios";
import cheerio from "cheerio";
import * as d3 from "d3";

const PlayerComparisonChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        "/api/cors?url=https://www.messivsronaldo.app/"
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

      const resultHonors = await axios.get(
        "/api/cors?url=https://www.messivsronaldo.app/honours-and-achievements/"
      );
      const $honors = cheerio.load(resultHonors.data);

      const parameters = [
        "Champions League",
        "League Titles",
        "Domestic Cup",
        "Domestic Super Cup",
        "UEFA Super Cup",
        "Club World Cup",
        "Full Senior International",
      ];

      const scrapedData = parameters.map((parameter) => {
        const article = $honors(`h2:contains("${parameter}")`).parent();
        const messiValue = parseInt(
          article
            .find(".DetailedStatsPageBlock-module--mainStat--Opo-J")
            .first()
            .text()
        );
        const ronaldoValue = parseInt(
          article
            .find(".DetailedStatsPageBlock-module--mainStat--Opo-J")
            .eq(1)
            .text()
        );
        return { parameter, messiValue, ronaldoValue };
      });

      setData([
        {
          parameter: "GOALS",
          messiValue: messiGoals,
          ronaldoValue: ronaldoGoals,
        },
        ...scrapedData,
      ]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    renderLineChart(data);
  }, [data]);

  useEffect(() => {
    if (data.length === 0) return;
    data.forEach((item, index) => renderChart(item, index));
  }, [data]);

  const renderLineChart = (data) => {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 40, bottom: 50, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    const x = d3.scalePoint().range([0, width]).padding(0.5);
    const y = d3.scaleLinear().range([height, 0]);

    d3.select("#lineChart").select("svg").remove();

    const svg = d3
      .select("#lineChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 50)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain(data.map((d) => d.parameter));
    y.domain([0, d3.max(data, (d) => Math.max(d.messiValue, d.ronaldoValue))]);

    // Define the lines
    const messiLine = d3
      .line()
      .x((d) => x(d.parameter))
      .y((d) => y(d.messiValue));

    const ronaldoLine = d3
      .line()
      .x((d) => x(d.parameter))
      .y((d) => y(d.ronaldoValue));

    // Add the Messi line
    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", messiLine)
      .style("stroke", "blue")
      .style("stroke-width", 2)
      .style("fill", "none");

    // Add the Ronaldo line
    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", ronaldoLine)
      .style("stroke", "red")
      .style("stroke-width", 2)
      .style("fill", "none");

    // Add the X Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add the Y Axis
    svg.append("g").call(d3.axisLeft(y));
  };

  const renderChart = (item, index) => {
    const { parameter, messiValue, ronaldoValue } = item;

    const playerData = [
      { name: "Messi", value: messiValue },
      { name: "Ronaldo", value: ronaldoValue },
    ];

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 40, bottom: 50, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    const x = d3.scaleBand().range([0, width]).padding(0.5);
    const y = d3.scaleLinear().range([height, 0]);

    d3.select(`#chart${index}`).select("svg").remove();
    const tooltip = d3.select(`#tooltip${index}`);

    const svg = d3
      .select(`#chart${index}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain(playerData.map((d) => d.name));
    y.domain([0, d3.max(playerData, (d) => d.value)]);

    svg
      .selectAll(".bar")
      .data(playerData)
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
          .html(`${parameter}: ${d.value}`)
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
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value));

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

    // add the y Axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(parameter);
  };

  return (
    <div>
      {data.map((_, index) => (
        <React.Fragment key={index}>
          <div id={`chart${index}`}></div>
          <div
            id={`tooltip${index}`}
            style={{ opacity: 0, position: "absolute" }}
          ></div>
        </React.Fragment>
      ))}
      <div id="lineChart"></div>
    </div>
  );
};

export default PlayerComparisonChart;
