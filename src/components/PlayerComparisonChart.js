import React, { useState, useEffect } from "react";
import axios from "axios";
import cheerio from "cheerio";
import * as d3 from "d3";

const PlayerComparisonChart = () => {
  const [data, setData] = useState([]);
  const [messiGoals, setMessiGoals] = useState([]);
  const [ronaldoGoals, setRonaldoGoals] = useState([]);

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
    renderHistogram(data);
    renderHorizontalHistogram(data);
    renderLineGraph(messiGoals, ronaldoGoals);
  }, [data, messiGoals, ronaldoGoals]);

  const renderHistogram = (data) => {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 40, bottom: 50, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    const x0 = d3.scaleBand().range([0, width]).paddingInner(0.2);
    const x1 = d3.scaleBand().padding(0.05);
    const y = d3.scaleLog().base(2).range([height, 0]).clamp(true);

    d3.select("#chart").select("svg").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x0.domain(data.map((d) => d.parameter));
    x1.domain(["Messi", "Ronaldo"]).range([0, x0.bandwidth() / data.length]);
    y.domain([
      1,
      d3.max(data, (d) => Math.max(d.messiValue, d.ronaldoValue) + 1),
    ]);

    data.forEach((item) => {
      const { parameter, messiValue, ronaldoValue } = item;
      const playerData = [
        { name: "Messi", value: messiValue },
        { name: "Ronaldo", value: ronaldoValue },
      ];

      svg
        .append("g")
        .selectAll("g")
        .data([playerData])
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${x0(parameter)},0)`)
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect")
        .attr("x", (d) => x1(d.name))
        .attr("y", (d) => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => height - y(d.value))
        .attr("fill", (d) => (d.name === "Messi" ? "blue" : "red"));
    });

    // add the x Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

    // add the x Axis label
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + "," + (height + margin.bottom / 1.5) + ")"
      )
      .style("text-anchor", "middle")
      .text("Parameter");
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
      .text("Value");
  };

  const renderHorizontalHistogram = (data) => {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 40, bottom: 50, left: 120 },
      width = 1080 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    const y0 = d3.scaleBand().range([0, height]).paddingInner(0.2);
    const y1 = d3.scaleBand().padding(0.05);
    const x = d3.scaleLog().base(2).range([0, width]).clamp(true);

    d3.select("#horizontal-chart").select("svg").remove();

    const svg = d3
      .select("#horizontal-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    y0.domain(data.map((d) => d.parameter));
    y1.domain(["Messi", "Ronaldo"]).range([0, y0.bandwidth() / data.length]);
    x.domain([
      1,
      d3.max(data, (d) => Math.max(d.messiValue, d.ronaldoValue) + 1),
    ]);

    data.forEach((item) => {
      const { parameter, messiValue, ronaldoValue } = item;
      const playerData = [
        { name: "Messi", value: messiValue },
        { name: "Ronaldo", value: ronaldoValue },
      ];

      svg
        .append("g")
        .selectAll("g")
        .data([playerData])
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(0,${y0(parameter)})`)
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect")
        .attr("y", (d) => y1(d.name))
        .attr("width", (d) => x(d.value))
        .attr("height", y1.bandwidth())
        .attr("width", (d) => x(d.value))
        .attr("fill", (d) => (d.name === "Messi" ? "blue" : "red"));
    });

    // add the y Axis
    svg.append("g").call(d3.axisLeft(y0));

    // add the y Axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Parameter");

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
      .style(".anchor", "middle")
      .text("Value");
  };

  const fetchGoalsData = async (url) => {
    const result = await axios.get(`/api/cors?url=${url}`);
    const $ = cheerio.load(result.data);
    const goals = $(".MatchHistory-module--totalsVal--1tQXf")
      .first()
      .text()
      .replace(/\,/g, "")
      .split(" ")
      .map((goal) => parseInt(goal));
    return goals;
  };

  useEffect(() => {
    const fetchGoals = async () => {
      const messiGoalsData = await fetchGoalsData(
        "https://www.messivsronaldo.app/match-histories/messi-match-history/"
      );
      const ronaldoGoalsData = await fetchGoalsData(
        "https://www.messivsronaldo.app/match-histories/ronaldo-match-history/"
      );
      console.log(messiGoalsData, ronaldoGoalsData);
      setMessiGoals(messiGoalsData);
      setRonaldoGoals(ronaldoGoalsData);
    };
    fetchGoals();
  }, []);

  const renderLineGraph = (messiGoals, ronaldoGoals) => {
    const margin = { top: 30, right: 40, bottom: 50, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, 100]) // Change the domain to [0, 100]
      .range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(messiGoals.concat(ronaldoGoals))])
      .range([height, 0]);

    d3.select("#line-chart").select("svg").remove();

    const svg = d3
      .select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const line = d3
      .line()
      .x((_, i) => x(i))
      .y((d) => y(d));

    const createLine = (data, color) => {
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", line);
    };

    // Calculate the number of goals scored per 1% of their matches
    const messiGoalsPerSegment = messiGoals[0] / 100;
    const ronaldoGoalsPerSegment = ronaldoGoals[0] / 100;

    // Generate data for both players with 100 equal parts
    const messiData = Array.from(
      { length: 100 },
      (_, i) => (i + 1) * messiGoalsPerSegment
    );
    const ronaldoData = Array.from(
      { length: 100 },
      (_, i) => (i + 1) * ronaldoGoalsPerSegment
    );

    createLine(messiData, "blue");
    createLine(ronaldoData, "red");

    // Add the x Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add the x Axis label
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + "," + (height + margin.bottom / 1.5) + ")"
      )
      .style("text-anchor", "middle")
      .text("Number of Matches");

    // Add the y Axis
    svg.append("g").call(d3.axisLeft(y));

    // Add the y Axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Total Number of Goals");
  };

  return (
    <div>
      <div id="chart"></div>
      <div id="horizontal-chart"></div>
      <div id="line-chart"></div>
    </div>
  );
};

export default PlayerComparisonChart;
