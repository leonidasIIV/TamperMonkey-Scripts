#!/usr/bin/env python

"""

This module generates a meta file for given TampeMonkey usersripts.

Attributes:

This module requires python 3.2 or greater.

"""

import argparse
import os
import sys
import re
import struct

BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE = range(8)
TEXT, INFO, WARN, ERROR, DEBUG = range(5)

messagePrefix = ["      ", "INFO: ", "WARN: ", "ERRO: ", "DBUG: "]
beginMeta = re.compile(r".*// ==UserScript==.*")
endMeta = re.compile(r".*// ==/UserScript==.*")

infoColor = CYAN
warnColor = YELLOW
errorColor = RED
debugColor = GREEN

# Following from Python cookbook, #475186
def has_colours(stream):
    if not hasattr(stream, "isatty"):
        return False
    if not stream.isatty():
        return False # auto color only on TTYs
    try:
        import curses
        curses.setupterm()
        return curses.tigetnum("colors") > 2
    except:
        # guess false in case of error
        return False
has_colours = has_colours(sys.stdout)

def printout(text, colour=WHITE):
    if has_colours:
        seq = "\x1b[1;%dm" % (30+colour) + text + "\x1b[0m"
        sys.stdout.write(seq)
    else:
        sys.stdout.write(text)

def printMessage(text, type, level=0):
    if (type == TEXT):
        print(text)
    elif (type == INFO and not args.quiet and args.verbose >= level):
        printout(messagePrefix[type], infoColor)
        print(text)
    elif (type == WARN):
        printout(messagePrefix[type], warnColor)
        print(text)
    elif (type == ERROR):
        printout(messagePrefix[type], errorColor)
        print(text)
    elif (type == DEBUG and not args.quiet and args.verbose >= 3):
        printout(messagePrefix[type], debugColor)
        print(text)

def validateUserFilename(filePath):
    printMessage("Validating filename...", INFO)
    root, ext2 = os.path.splitext(filePath)
    root, ext1 = os.path.splitext(root)
    printMessage(filePath, DEBUG)
    printMessage(ext1, DEBUG)
    printMessage(ext2, DEBUG)
    if (ext1 == ".user" and ext2 == ".js"):
        return True
    else:
        return False

def getMetaFilename(filePath):
    printMessage("Generating Meta Filename...", INFO)
    root, ext2 = os.path.splitext(filePath)
    root, ext1 = os.path.splitext(root)
    printMessage(filePath, DEBUG)
    printMessage(ext1, DEBUG)
    printMessage(ext2, DEBUG)
    return root + ".meta" + ext2

def parseFile(path):
    metaFound = False
    printMessage("Working with " + path, INFO)
    if args.verbose > 1:
        printMessage(path, DEBUG)
    if not validateUserFilename(path):
        printMessage(path + " does not meet filename format (*.user.js)", ERROR)
        return
    fileContents = open(path, "r")
    outputFile = open(getMetaFilename(path), "w")
    for line in fileContents:
        printMessage(line.rstrip("\r\n"), DEBUG)
        if beginMeta.search(line) and metaFound == False:
            printMessage("Found begining of meta section...", INFO, 1)
            printMessage("Writing meta section to meta file...", INFO, 1)
            metaFound = True
            outputFile.write(line)
        elif metaFound == True:
            outputFile.write(line)
            if endMeta.search(line):
                printMessage("Found end of meta section...", INFO, 1)
                metaFound = False
                fileContents.close()
                outputFile.close()
                printMessage("Meta file succesfully generated.", INFO)
                printMessage(getMetaFilename(path), TEXT)
                return
    if os.path.getsize(path) == 0:
        printMessage("No meta section found, deleting empty meat file", WARN)
        os.remove(getMetaFilename(path))

# Set up arguemnts parser
parser = argparse.ArgumentParser()
parser.add_argument("path",
                    help="The path to generate the meta file[s] from.")
parser.add_argument("-r", "--recursive", action="store_true",
                    help="If the given path is a directory, recurse over all contents.")
group = parser.add_mutually_exclusive_group()
group.add_argument("-v", "--verbose", action="count", default=0,
                    help="Enable verbose output.")
group.add_argument("-q", "--quiet", action="store_true",
                    help="Minimal output.")
args = parser.parse_args()

# begin execution
if (os.path.exists(args.path)):
    printMessage("Path: " + args.path + " Exists!", DEBUG)
    if (os.path.isdir(args.path)):
        for subDir, dirs, files in os.walk(args.path):
            for file in files:
                filePath = os.path.join(subDir, file)
                if (os.path.dirname(filePath) == args.path or args.recursive):
                    parseFile(filePath)
    else:
        parseFile(args.path)
else:
    printMessage("Path does not exist!", ERROR)

