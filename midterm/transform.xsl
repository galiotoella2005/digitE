<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs math xd"
    version="3.0">
<xsl:mode on-no-match="shallow-copy"/>
<xsl:template match="text">    
    <xsl:for-each select=".">
        <xsl:variable name="chunks" select=" . ! tokenize(., ' ')"/>
        <xsl:variable name="number" select="count($chunks)"/>
        <text WC="{$number}">
            <xsl:apply-templates/>
        </text>
    </xsl:for-each> 
</xsl:template>
</xsl:stylesheet>