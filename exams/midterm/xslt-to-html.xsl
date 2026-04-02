<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs math xd"
    version="3.0">
<xsl:output method="html" indent="yes"/>

<xsl:template match="/">
<html>
    <head>
        <title>Midterm: Zoom Transcript Data</title>
        <link rel="stylesheet" type="text/css" href="style.css"/>
    </head>
    <body>
        <h1 id="top">Midterm: Zoom Transcript Data</h1>  
        <section id="contents">
            <table>
                <tr>
                    <th>Entry number</th>
                    <th>Timestamp</th>
                    <th>Text</th>
                    <th>Text</th>
                </tr>
                <xsl:apply-templates select="//entry"/>
            </table>
        </section>
    </body>
</html>
</xsl:template>
    <xsl:template match="entry">
        <tr>
            <td><xsl:value-of select="descendant::number"/></td>
            <td><xsl:value-of select="descendant::timestamp/(@from|@to)"/></td>
            <td><xsl:value-of select="descendant::text[1]"/></td>
            <td><xsl:value-of select="descendant::text[2]"/></td>
        </tr>
    </xsl:template>
</xsl:stylesheet>