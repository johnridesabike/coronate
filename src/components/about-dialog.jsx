import React from "react";
import {ifElectronOpen} from "../electron-utils";
import logo from "../icon-min.svg";

const GITHUB_URL = "https://github.com/johnridesabike/chessahoochee";
const LICENSE_URL = (
    "https://github.com/johnridesabike/chessahoochee/blob/master/LICENSE"
);

const About = (props) => (
    <article
        style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%"
        }}
    >
        <div style={{flex: "0 0 48%", textAlign: "center"}}>
            <img src={logo} height="196" width="196" alt=""/>
        </div>
        <div style={{flex: "0 0 48%"}}>
            <h1 className="title">Chessahoochee</h1>
            <p>Copyright &copy; 2019 John Jackson</p>
            <p>Chessahoochee is free software.</p>
            <p>
                <a
                    href={GITHUB_URL}
                    onClick={(e) => ifElectronOpen(e, GITHUB_URL)}
                >
                    Source code is available
                </a><br />
                {" "}under the{" "}
                <a
                    href={LICENSE_URL}
                    onClick={(e) => ifElectronOpen(e, LICENSE_URL)}
                >
                    AGPL v3.0 license
                </a>.
            </p>
        </div>
    </article>
);
export default About;
