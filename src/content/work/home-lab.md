---
code: ENG-01
title: Segmented home lab with SIEM and IDS
date: 2026-10-15
status: in-progress
summary: VLAN-segmented lab on Proxmox with an OPNsense firewall at the edge. Wazuh collects logs from seven agents across servers, the firewall and a laptop, deployed with an Ansible role. Suricata runs as an IDS on edge traffic and feeds its alerts into Wazuh.
topics: [network, siem, detection]
tags: [Proxmox, OPNsense, Wazuh, Suricata, Ansible]
---
