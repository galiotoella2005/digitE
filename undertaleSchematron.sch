<?xml version="1.0" encoding="UTF-8"?>
<sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2"
    xmlns:sqf="http://www.schematron-quickfix.com/validator/process"
    xmlns="http://purl.oclc.org/dsdl/schematron"> 
    <!--<ns uri="http://www.tei-c.org/ns/1.0" prefix="tei"/>-->
    
    <!--<let name="idPath" value="doc('Asreil_Dialogue-J.xml')//@xml:id"/>-->
    <pattern>
        <rule context="@xml:id">
            <report test="starts-with(., '#')">
                xml:id attributes must not begin with a hashtag!
            </report>
        </rule>
    </pattern>
    <pattern>
        <rule context="act">
            <let name="tokens" value="for $w in tokenize(@speakerRef, '\s+') return $w"/>
            <assert test="every $token in $tokens satisfies $token =  ancestor::undertale/metadata//refList/name/@xml:id ! string()">
                Every name (@speakerRef after the hashtag must match an xml:id defined in the refList in this file.
            </assert>
        </rule>
    </pattern>
</sch:schema>
