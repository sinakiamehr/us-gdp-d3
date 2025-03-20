import "./App.css";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function App() {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tooltipRef = useRef();

  // Fetch Data Once When Component Mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Resize Listener
  useEffect(() => {
    const renderChart = () => {
      if (data.length === 0) return;

      const containerWidth = window.innerWidth * 0.9;
      const width = containerWidth > 800 ? 800 : containerWidth;
      const height = width * 0.6;
      const padding = 50;

      // Select the SVG element
      const svg = d3
        .select(svgRef.current)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("background", "darkgrey");

      svg.selectAll("*").remove(); // Clear previous elements

      // Define Scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d[0]))
        .range([padding, width - padding])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[1])])
        .range([height - padding, padding]);

      // Append bars
      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .attr("x", (d) => xScale(d[0]))
        .attr("y", (d) => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - padding - yScale(d[1]))
        .attr("fill", "#3498db")
        .on("mouseover", (event, d) => {
          d3.select(tooltipRef.current)
            .style("opacity", 1)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px")
            .attr("data-date", d[0])
            .html(`Date: ${d[0]}<br>GDP: $${d[1]} Billion`);
        })
        .on("mouseout", () => {
          d3.select(tooltipRef.current).style("opacity", 0);
        });

      // Create Axes
      const xAxis = d3
        .axisBottom(xScale)
        .tickValues(xScale.domain().filter((_, i) => i % 60 === 0));
      const yAxis = d3.axisLeft(yScale).ticks(10);

      svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxis);

      svg
        .append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);

      // Add Chart Title
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", padding / 2)
        .attr("text-anchor", "middle")
        .attr("id", "title")
        .style("font-weight", "bold")
        .style("font-size", "1.5em")
        .text("USA GDP");
    };

    renderChart();

    // Add Resize Event Listener
    window.addEventListener("resize", renderChart);
    return () => window.removeEventListener("resize", renderChart);
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          The data below represents the GDP of the USA over the past decade.
        </h1>
        <h2>Hover over the bars to see the GDP values.</h2>
      </header>
      <svg ref={svgRef}></svg>
      {/* Tooltip Element */}
      <div ref={tooltipRef} id="tooltip"></div>
      <footer className="footer">
        <p>
          Coded and Designed by <strong>Sina Kiamehr</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
