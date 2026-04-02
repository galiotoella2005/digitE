<?xml version="1.0" encoding="UTF-8"?>
<p:declare-step name="zoom" xmlns:p="http://www.w3.org/ns/xproc"
    exclude-inline-prefixes="#all" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ex="extensions"
    xmlns:cx="http://xmlcalabash.com/ns/extensions" xmlns:c="http://www.w3.org/ns/xproc-step"
    version="3.0">
    <p:input port="source" primary="true" content-types="text/plain" href="Galioto_zoom-transcript.txt"/>
    <p:invisible-xml cx:processor="markup-blitz">
        <!--ebb: As of now (version 28) oXygen will flag <p:invisible-xml> as an error. 
            Don't worry. It's not!  -->
        <p:with-input port="grammar">
            <p:document href="Galioto_zoom-transcript.ixml" content-type="text/plain"/>
        </p:with-input>
    </p:invisible-xml>
    <!--  You have to store your output! We've added an optional message to show you whether the invisible XML processed. -->
    <p:store name="simple-XML" href="output/output.xml"/>
    <p:identity message="Stored some simple XML made by invisible XML grammar."/>
    <p:xslt>
        <!-- We found we did not need to specify the <p:with-input> line below, because 
    if we do not specify an input we make an "implicit connection" to process the result of the
    previous step. We're just commenting it out in case you ever want to use it. You might want 
    someday want to specify a *different* input port than the immediately preceding one. -->
        <!--    <p:with-input port="source">
            <p:pipe step="simple-XML" port="result"/>
        </p:with-input>-->
        <p:with-input port="stylesheet" href="transform.xsl"/>
    </p:xslt>
    <p:store name="xsl" href="output/output2.xml"></p:store>
    <p:identity message="XSLT transformation."/>
    <p:xslt>
        <p:with-input port="stylesheet" href="xslt-to-html.xsl"/>
    </p:xslt>
    <p:store name="xsl-2" href="output/output3.html"></p:store>
    <p:identity message="HTML creation"/>
</p:declare-step>